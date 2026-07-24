const Menu = require('../models/menu');
const Order = require('../models/order');
const axios = require('axios');
const { PAYSTACK_SECRET_KEY, PAYSTACK_PAYMENT_CHANNELS } = require('../config/env');

const orderPopulate = [
  { path: 'user', select: 'name email phone role' },
  {
    path: 'items.menuItem',
    select: 'name category imageUrl available',
    populate: { path: 'category', select: 'name description' },
  },
];

const normalizePaymentMethod = (paymentMethod) => (
  paymentMethod === 'cash_on_delivery' ? 'payment_on_delivery' : paymentMethod
);

const paymentError = (message, status = 502) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const orderTotalInKobo = (order) => Math.round(Number(order.totalAmount) * 100);

const restoreOrderInventory = async (order) => {
  const quantitiesByMenuItem = new Map();
  for (const { menuItem, quantity } of order.items) {
    const id = (menuItem?._id || menuItem).toString();
    quantitiesByMenuItem.set(id, (quantitiesByMenuItem.get(id) || 0) + quantity);
  }

  await Promise.all([...quantitiesByMenuItem].map(([menuItem, quantity]) => (
    Menu.findByIdAndUpdate(menuItem, {
      $inc: { stock: quantity },
      $set: { available: true },
    })
  )));
};

const requestPaystack = async (path, options = {}) => {
  if (!PAYSTACK_SECRET_KEY) {
    throw paymentError('Online payments are not configured. Please choose payment on delivery.', 503);
  }

  let payload;
  try {
    const response = await axios({
      baseURL: 'https://api.paystack.co',
      url: path,
      method: options.method || 'GET',
      data: options.data,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: 15_000,
      validateStatus: () => true,
    });
    payload = response.data;

    if (!response.status || response.status < 200 || response.status >= 300 || !payload?.status) {
      throw paymentError(payload?.message || 'Paystack could not process this payment. Please try again.');
    }
  } catch (err) {
    if (err.status) {
      throw err;
    }
    throw paymentError('Unable to reach Paystack. Please try again.');
  }

  return payload.data;
};

const initializePaystackTransaction = async (order, user, paystackChannel) => {
  const reference = `SB-${order._id.toString()}-${Date.now()}`;
  const transaction = await requestPaystack('/transaction/initialize', {
    method: 'POST',
    data: {
      email: user.email,
      amount: orderTotalInKobo(order),
      currency: 'NGN',
      reference,
      channels: paystackChannel ? [paystackChannel] : PAYSTACK_PAYMENT_CHANNELS,
      metadata: JSON.stringify({ orderId: order._id.toString() }),
    },
  });

  if (!transaction?.access_code || !transaction.reference) {
    throw paymentError('Paystack did not return a payment session. Please try again.');
  }

  order.paymentReference = transaction.reference;
  await order.save();
  return transaction.access_code;
};

const normalizeOrderPaymentMethod = (order) => {
  if (!order) {
    return order;
  }

  const normalizedPaymentMethod = normalizePaymentMethod(order.paymentMethod);
  if (typeof order.toObject === 'function') {
    const normalizedOrder = {
      ...order.toObject(),
      paymentMethod: normalizedPaymentMethod,
    };
    return {
      ...normalizedOrder,
      // Orders created before orderStatus was introduced retain their legacy
      // status while still returning the new API field.
      orderStatus: normalizedOrder.orderStatus || normalizedOrder.status,
    };
  }

  return {
    ...order,
    paymentMethod: normalizedPaymentMethod,
    orderStatus: order.orderStatus || order.status,
  };
};

exports.createOrder = async (req, res) => {
  // Keep this outside the try block's inner scopes so a failed order write can
  // return only the inventory that was actually reserved.
  let deductedItems = [];
  let orderCreated = false;

  try {
    const { items, notes, deliveryAddress, paymentMethod, paystackChannel } = req.body;
    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

    if (
      normalizedPaymentMethod === 'paystack'
      && paystackChannel
      && !PAYSTACK_PAYMENT_CHANNELS.includes(paystackChannel)
    ) {
      return res.status(400).json({
        success: false,
        message: 'That Paystack payment type is not enabled for this business.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one order item.',
      });
    }

    const validItems = items.every((item) => (
      item
      && item.menuItem
      && Number.isInteger(item.quantity)
      && item.quantity > 0
    ));
    if (!validItems) {
      return res.status(400).json({
        success: false,
        message: 'Each item requires a menuItem id and a whole-number quantity of at least 1.',
      });
    }

    const quantitiesByMenuItem = new Map();
    for (const { menuItem, quantity } of items) {
      const id = menuItem.toString();
      quantitiesByMenuItem.set(id, (quantitiesByMenuItem.get(id) || 0) + quantity);
    }

    const menuItemIds = [...quantitiesByMenuItem.keys()];
    const menuItems = await Menu.find({ _id: { $in: menuItemIds } });
    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more menu items do not exist.',
      });
    }

    const menuById = new Map(menuItems.map((item) => [item._id.toString(), item]));
    const unavailableItems = menuItems.reduce((unavailable, item) => {
      const requestedQuantity = quantitiesByMenuItem.get(item._id.toString());
      const stock = Number.isInteger(item.stock) ? item.stock : 0;
      if (!item.available) {
        unavailable.push({
          menuItem: item._id,
          name: item.name,
          requestedQuantity,
          remainingStock: stock,
          message: `${item.name} is currently unavailable.`,
        });
      } else if (stock === 0) {
        unavailable.push({
          menuItem: item._id,
          name: item.name,
          requestedQuantity,
          remainingStock: 0,
          message: `${item.name} is currently out of stock.`,
        });
      } else if (stock < requestedQuantity) {
        unavailable.push({
          menuItem: item._id,
          name: item.name,
          requestedQuantity,
          remainingStock: stock,
          message: `Only ${stock} ${item.name} remaining in stock.`,
        });
      }
      return unavailable;
    }, []);

    if (unavailableItems.length > 0) {
      return res.status(409).json({
        success: false,
        message: unavailableItems[0].message,
        unavailableItems,
      });
    }

    // Deduct each item's stock conditionally. This prevents an order from
    // overselling inventory if another order is placed at the same time.
    for (const [menuItemId, quantity] of quantitiesByMenuItem) {
      const updatedItem = await Menu.findOneAndUpdate(
        { _id: menuItemId, available: true, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!updatedItem) {
        await Promise.all(deductedItems.map(({ id, quantity: deductedQuantity }) => (
          Menu.findByIdAndUpdate(id, {
            $inc: { stock: deductedQuantity },
            $set: { available: true },
          })
        )));

        const currentItem = await Menu.findById(menuItemId);
        const remainingStock = currentItem && Number.isInteger(currentItem.stock)
          ? currentItem.stock
          : 0;
        const name = currentItem ? currentItem.name : 'This item';
        const message = !currentItem?.available
          ? `${name} is currently unavailable.`
          : remainingStock === 0
            ? `${name} is currently out of stock.`
            : `Only ${remainingStock} ${name} remaining in stock.`;

        return res.status(409).json({
          success: false,
          message,
          unavailableItems: [{
            menuItem: menuItemId,
            name,
            requestedQuantity: quantity,
            remainingStock,
            message,
          }],
        });
      }

      deductedItems.push({ id: updatedItem._id, quantity });
      if (updatedItem.stock === 0) {
        // Only mark the item unavailable if it is still sold out. A restock
        // between the two writes must not be overwritten by this order.
        await Menu.findOneAndUpdate(
          { _id: updatedItem._id, stock: 0 },
          { $set: { available: false } }
        );
      }
    }

    const orderItems = items.map(({ menuItem, quantity }) => {
      const currentItem = menuById.get(menuItem.toString());
      return {
        menuItem: currentItem._id,
        name: currentItem.name,
        price: currentItem.price,
        quantity,
      };
    });
    const totalAmount = orderItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod: normalizedPaymentMethod,
      notes,
    });
    orderCreated = true;

    if (normalizedPaymentMethod === 'paystack') {
      try {
        const accessCode = await initializePaystackTransaction(order, req.user, paystackChannel);
        await order.populate(orderPopulate);
        return res.status(201).json({
          success: true,
          order: normalizeOrderPaymentMethod(order),
          accessCode,
        });
      } catch (paymentErr) {
        try {
          await order.deleteOne();
          await restoreOrderInventory(order);
        } catch (rollbackErr) {
          console.error('Paystack order rollback error:', rollbackErr);
        }

        return res.status(paymentErr.status || 502).json({
          success: false,
          message: paymentErr.message || 'Unable to start the Paystack payment. Please try again.',
        });
      }
    }

    await order.populate(orderPopulate);

    return res.status(201).json({ success: true, order: normalizeOrderPaymentMethod(order) });
  } catch (err) {
    // If the order document could not be written, release the inventory that
    // was already reserved. Once an order exists, its inventory is owned by
    // that order and must not be restored by a response/population failure.
    if (!orderCreated && deductedItems.length > 0) {
      try {
        await Promise.all(deductedItems.map(({ id, quantity }) => (
          Menu.findByIdAndUpdate(id, {
            $inc: { stock: quantity },
            $set: { available: true },
          })
        )));
      } catch (rollbackErr) {
        console.error('Order inventory rollback error:', rollbackErr);
      }
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'One or more menu item ids are invalid.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Create order error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating order.' });
  }
};

exports.verifyPaystackPayment = async (req, res) => {
  try {
    const submittedReference = typeof req.body?.reference === 'string'
      ? req.body.reference.trim()
      : '';

    if (!submittedReference) {
      return res.status(400).json({
        success: false,
        message: 'A Paystack payment reference is required.',
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      paymentMethod: 'paystack',
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Paystack order not found.' });
    }

    if (submittedReference !== order.paymentReference) {
      return res.status(400).json({
        success: false,
        message: 'The Paystack reference does not match this order.',
      });
    }

    if (order.paymentStatus === 'paid') {
      await order.populate(orderPopulate);
      return res.status(200).json({ success: true, order: normalizeOrderPaymentMethod(order) });
    }

    if (!order.paymentReference) {
      return res.status(400).json({ success: false, message: 'This order has no Paystack payment reference.' });
    }

    const transaction = await requestPaystack(`/transaction/verify/${encodeURIComponent(submittedReference)}`);
    const metadata = typeof transaction.metadata === 'string'
      ? JSON.parse(transaction.metadata)
      : transaction.metadata;
    const expectedAmount = orderTotalInKobo(order);
    const transactionEmail = String(transaction.customer?.email || '').toLowerCase();
    const orderEmail = String(req.user.email || '').toLowerCase();

    if (
      transaction.status !== 'success'
      || transaction.reference !== order.paymentReference
      || Number(transaction.amount) !== expectedAmount
      || transaction.currency !== 'NGN'
      || metadata?.orderId !== order._id.toString()
      || transactionEmail !== orderEmail
      || !transaction.id
    ) {
      return res.status(400).json({
        success: false,
        message: 'Paystack could not verify this payment for the order.',
      });
    }

    order.paymentStatus = 'paid';
    order.transactionId = String(transaction.id);
    order.paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date();
    // Payment confirmation does not confirm kitchen preparation. The admin
    // moves this pending order through the fulfilment workflow separately.
    await order.save();
    await order.populate(orderPopulate);
    return res.status(200).json({ success: true, order: normalizeOrderPaymentMethod(order) });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order id.' });
    }
    if (err instanceof SyntaxError) {
      return res.status(502).json({ success: false, message: 'Paystack returned invalid payment metadata.' });
    }
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error('Verify Paystack payment error:', err);
    return res.status(500).json({ success: false, message: 'Unable to verify the Paystack payment.' });
  }
};

exports.cancelPaystackPayment = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      paymentMethod: 'paystack',
      paymentStatus: 'unpaid',
      status: 'pending',
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pending Paystack order not found.' });
    }

    await order.deleteOne();
    await restoreOrderInventory(order);
    return res.status(200).json({ success: true, message: 'Paystack payment cancelled.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order id.' });
    }
    console.error('Cancel Paystack payment error:', err);
    return res.status(500).json({ success: false, message: 'Unable to cancel the Paystack payment.' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'items.menuItem',
        select: 'name category imageUrl available',
        populate: { path: 'category', select: 'name description' },
      })
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders: orders.map(normalizeOrderPaymentMethod) });
  } catch (err) {
    console.error('Get my orders error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving orders.' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(orderPopulate)
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders: orders.map(normalizeOrderPaymentMethod) });
  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving orders.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Order status is required.' });
    }

    const update = { status, orderStatus: status };

    if (req.user.role === 'delivery_staff' && status === 'delivered') {
      update.paymentStatus = 'paid';
      update.paidAt = new Date();
    }

    if (status === 'cancelled') {
      // The status condition makes a duplicate cancellation idempotent: only
      // the request that changes the order to cancelled restores inventory.
      const order = await Order.findOneAndUpdate(
        { _id: req.params.id, status: { $ne: 'cancelled' } },
        update,
        { new: true, runValidators: true }
      );

      if (!order) {
        const existingOrder = await Order.findById(req.params.id).populate(orderPopulate);
        if (!existingOrder) {
          return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // It was already cancelled and its stock was restored by the request
        // that first applied the cancellation.
        return res.status(200).json({
          success: true,
          order: normalizeOrderPaymentMethod(existingOrder),
        });
      }

      await restoreOrderInventory(order);
      await order.populate(orderPopulate);
      return res.status(200).json({ success: true, order: normalizeOrderPaymentMethod(order) });
    }

    // A cancelled order has already returned its stock. Do not let it move
    // back into the fulfilment workflow without creating a new order.
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: { $ne: 'cancelled' } },
      update,
      { new: true, runValidators: true }
    ).populate(orderPopulate);
    if (!order) {
      const existingOrder = await Order.findById(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      return res.status(409).json({
        success: false,
        message: 'Cancelled orders cannot be moved back into fulfilment.',
      });
    }
    return res.status(200).json({ success: true, order: normalizeOrderPaymentMethod(order) });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order id.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Update order status error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating order status.' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ success: false, message: 'Payment status is required.' });
    }

    const update = {
      paymentStatus,
      paidAt: paymentStatus === 'paid' ? new Date() : null,
    };
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate(orderPopulate);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({ success: true, order: normalizeOrderPaymentMethod(order) });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order id.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Update payment status error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating payment status.' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Creating an order deducts inventory, so deleting it returns the ordered
    // quantities to stock and makes those menu items available again.
    await restoreOrderInventory(order);

    return res.status(200).json({ success: true, message: 'Order deleted and inventory restored.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order id.' });
    }
    console.error('Delete order error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting order.' });
  }
};
