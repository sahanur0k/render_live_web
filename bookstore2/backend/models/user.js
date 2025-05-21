const mongoose= require('mongoose');
const {models} = require("mongoose");
const userSchema= new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true

        
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\+?[1-9]\d{9,14}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    address: {
        type: String,
        required: true
    },
    avator: {
        type: String,
        default: "https://www.w3schools.com/howto/img_avatar.png"
    },
    role:
    {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    favourites: {
        type: mongoose.Types.ObjectId,
        ref:"book",
    },
    cart: {
        type: mongoose.Types.ObjectId,
        ref:"book",
    },
    order: {
        type: mongoose.Types.ObjectId,
        ref:"order",
    },
}, { timestamps: true });


module.exports= mongoose.model("User", userSchema);