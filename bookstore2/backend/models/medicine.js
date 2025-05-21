const mongoose = require('mongoose');
const user = require('./user');

const medicine = new mongoose.Schema({
    product_name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    image_url: {
        type: String,
        default: "https://via.placeholder.com/300x180"
    }
}, { timestamps: true });

module.exports = mongoose.model('medicine', medicine);
