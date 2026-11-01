const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  label: { type: String, required: true }, // Small, Medium, Large
  priceAdjustment: { type: Number, default: 0 }, // Added to base price
}, { _id: false });

const crustSchema = new mongoose.Schema({
  label: { type: String, required: true }, // Thin, Classic, Stuffed
  priceAdjustment: { type: Number, default: 0 },
}, { _id: false });

const toppingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  isVeg: { type: Boolean, default: true },
}, { _id: false });

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pizza name is required'],
      trim: true,
      maxlength: [80, 'Pizza name must not exceed 80 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [400, 'Description must not exceed 400 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Classic', 'Veggie', 'Cheese Lovers', 'Spicy', 'Specialty', 'BBQ'],
      default: 'Classic',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price must be non-negative'],
    },
    sizes: {
      type: [sizeSchema],
      default: [
        { label: 'Small', priceAdjustment: 0 },
        { label: 'Medium', priceAdjustment: 80 },
        { label: 'Large', priceAdjustment: 160 },
      ],
    },
    crusts: {
      type: [crustSchema],
      default: [
        { label: 'Thin', priceAdjustment: 0 },
        { label: 'Classic', priceAdjustment: 20 },
        { label: 'Stuffed', priceAdjustment: 60 },
      ],
    },
    availableToppings: {
      type: [toppingSchema],
      default: [],
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
pizzaSchema.index({ name: 'text', description: 'text' });
pizzaSchema.index({ category: 1, isAvailable: 1 });

const Pizza = mongoose.model('Pizza', pizzaSchema);
module.exports = Pizza;

