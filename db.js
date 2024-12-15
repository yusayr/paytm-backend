const mongoose = require("mongoose");
const { Schema } = mongoose;

async function mongoDbConnect() {
try {
    await mongoose.connect('mongodb+srv://yusayr:yusayr78654321@cluster0.chkmr.mongodb.net/paytm');
    
  } catch (error) {
    console.log(error);
  }
}


const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username Required"]
    },
    password: {
        type: String,
        required: [true, "Password Required"],
        minlength: [6, "Password has insufficient length"]
    },
    firstName: {
        type:String,
        required: [true, "First Name Required"],
        maxlength: 50
    },
    lastName: {
        type: String,
        required: [true, "Last Name Required"],
        maxlength: 50
    }
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true,
        ref: 'User'
    },
    balance: {
        type: Number,
        required: true
    }
});

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    Account
}


mongoDbConnect();
