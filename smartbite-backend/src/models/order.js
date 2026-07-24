const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Item quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Item quantity must be a whole number',
      },
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'An order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
      maxlength: [300, 'Delivery address cannot exceed 300 characters'],
    },
    paymentMethod: {
      type: String,
      enum: ['payment_on_delivery', 'paystack'],
      default: 'payment_on_delivery',
    },
    paymentReference: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    // Paystack transaction ids may exceed JavaScript's safe integer range, so
    // keep the value as a string exactly as Paystack returns it.
    transactionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    // Canonical payment-workflow status stored for integrations and reports.
    // `status` is retained below so the existing admin and delivery screens do
    // not need a breaking data migration.
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Order notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
