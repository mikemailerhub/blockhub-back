const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },

    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true,
    },

    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tutors",
        required: true,
    },

    amount: Number,
    platformFee: Number,

    tutorAmount: Number,

    currency: {
        type: String,
        enum: ["NGN", "USDT", "BNB"],
        default: "USDT",
        required: true,
    },

    paymentMethod: {
        type: String,
        enum: ["paystack", "crypto"],
        required: true,
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    },

    paymentReference: String,

    transactionHash: String,

    purchasedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports =
    mongoose.models.purchase ||
    mongoose.model("purchase", purchaseSchema);