const express = require("express");
const router = express.Router();
const { Account } = require("../db")
const { authMiddleware } = require("./middleware")
const mongoose = require("mongoose")

//apply transactions here

// to get user balance
router.post("/balance", authMiddleware, async (req,res)=> {
    const userId = req.body.userId;

    if (!userId) {
        res.status(400).json({
            error: "User Id is required"
        })
    }
    try {
        const account = await Account.findOne({
            userId : userId
        })
    
        if (!account) {
            console.log("not found")
            res.status(404).json("user not found")
        }
    
        res.json({
            balance : account.balance,
            username: account.username
        })
    }
    catch(err) {
        res.status(500).json({error: "Invalid UserId format"})
    }
    
})

//to transfer money to another account
router.post("/transfer", authMiddleware, async(req, res)=> {
    const session = await mongoose.startSession();
    session.startTransaction();
    const {amount, to, userId} = req.body;


    try {
        const senderAccount = await Account.findOne({userId : userId}).session(session); //session method used within transactional context

        if (!senderAccount || senderAccount.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({
                msg: "Insufficient balance or account does not exist"
        });
    }

        const toAccount = await Account.findOne({userId: to}).session(session)

        if (!toAccount){
        await session.abortTransaction()
        res.status(400).json({
            msg: "Receiver account not found"
        })
    }

    await Account.updateOne({userId: userId}, {$inc : {balance: -amount}}).session(session)
    await Account.updateOne({userId: to}, {$inc : {balance: amount}}).session(session)

    await session.commitTransaction();
    res.json({
        msg: "Transfer successful"
    })
    }
    catch(err) {
        await session.abortTransaction();
        res.status(500).json({error: "Transaction Failed"})
    }
    finally{
        session.endSession()
    }

})









module.exports = router;