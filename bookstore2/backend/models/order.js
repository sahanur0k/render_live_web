const mongoose = require('mongoose');
const user = require('./user');

const order = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: user,
        required: true
    },
    medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'medicine',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    status: {
        type: String,
        enum: ['order placed', 'shipped', 'delivered'],
        default: "order placed",
    }
}, { timestamps: true });

module.exports = mongoose.model("order", order);
