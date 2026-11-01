const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Snapshot of a topping at order time
const toppingSnapshotSchema = new mongoose.Schema({
  name: String,
  price: Number,
}, { _id: false });

// Snapshot of a single ordered item (pizza + customization)
const orderItemSchema = new mongoose.Schema({
  pizza: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pizza',
    required: true,
  },
  // Snapshots ensure historical orders are not affected by future menu changes
  pizzaName: { type: String, required: true },
  pizzaImage: { type: String, default: '' },
  size: { type: String, required: true },
  crust: { type: String, required: true },
  toppings: { type: [toppingSnapshotSchema], default: [] },
  quantity: { type: Number, required: true, min: 1, max: 10 },
  basePrice: { type: Number, required: true },
  sizeAdjustment: { type: Number, default: 0 },
  crustAdjustment: { type: Number, default: 0 },
  toppingsTotal: { type: Number, default: 0 },
  unitPrice: { type: Number, required: true }, // Final price per pizza
  itemTotal: { type: Number, required: true }, // unitPrice × quantity
  specialInstructions: { type: String, default: '', maxlength: 200 },
}, { _id: true });

const deliveryAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  postalCode: { type: String, required: true },
  instructions: { type: String, default: '', maxlength: 300 },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () => `CC-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 40 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    deliveryAddress: { type: deliveryAddressSchema, required: true },

    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'not_applicable'],
      default: 'pending',
    },

    // Razorpay references
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },

    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

