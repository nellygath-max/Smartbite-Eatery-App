const Menu = require('../models/menu');
const Order = require('../models/order');

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

const normalizeOrderPaymentMethod = (order) => {
  if (!order) {
    return order;
  }

  const normalizedPaymentMethod = normalizePaymentMethod(order.paymentMethod);
  if (typeof order.toObject === 'function') {
    return {
      ...order.toObject(),
      paymentMethod: normalizedPaymentMethod,
    };
  }

  return {
    ...order,
    paymentMethod: normalizedPaymentMethod,
  };
};

const deliveryStaffStatuses = new Set(['ready', 'out_for_delivery', 'delivered']);

exports.createOrder = async (req, res) => {
  try {
    const { items, notes, deliveryAddress, paymentMethod } = req.body;
    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

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
      if (stock === 0) {
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
    const deductedItems = [];
    for (const [menuItemId, quantity] of quantitiesByMenuItem) {
      const updatedItem = await Menu.findOneAndUpdate(
        { _id: menuItemId, stock: { $gte: quantity } },
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
        const message = remainingStock === 0
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
        await Menu.findByIdAndUpdate(updatedItem._id, { available: false });
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
    await order.populate(orderPopulate);

    return res.status(201).json({ success: true, order: normalizeOrderPaymentMethod(order) });
  } catch (err) {
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

    if (req.user.role === 'delivery_staff' && !deliveryStaffStatuses.has(status)) {
      return res.status(403).json({
        success: false,
        message: 'Delivery staff can only update ready, out_for_delivery, or delivered statuses.',
      });
    }

    const update = { status };

    if (req.user.role === 'delivery_staff' && status === 'delivered') {
      update.paymentStatus = 'paid';
    }

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

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
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
    const quantitiesByMenuItem = new Map();
    for (const { menuItem, quantity } of order.items) {
      const id = menuItem.toString();
      quantitiesByMenuItem.set(id, (quantitiesByMenuItem.get(id) || 0) + quantity);
    }
    await Promise.all([...quantitiesByMenuItem].map(([menuItem, quantity]) => (
      Menu.findByIdAndUpdate(menuItem, {
        $inc: { stock: quantity },
        $set: { available: true },
      })
    )));

    return res.status(200).json({ success: true, message: 'Order deleted and inventory restored.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order id.' });
    }
    console.error('Delete order error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting order.' });
  }
};
