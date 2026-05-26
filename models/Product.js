const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    trim: true
  },
  unitPrice: {
    type: Number,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  price: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  productImage: {
    type: String
  }
});

module.exports = mongoose.model('Product', productSchema);