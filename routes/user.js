const { User } = require("../db");
const { z } = require("zod");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const { JWT_SECRET_KEY } = require("../config")
const { authMiddleware } = require("./middleware")
const { Account } = require("../db")

const validatedSchema = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string()
})

//whatever routes are defined in user will go through api/v1/user
router.post("/signup", async (req, res) => {
    const result = validatedSchema.safeParse(req.body)
    if (!result.success) {
        return res.json({
            msg: "Invalid Inputs"
        })
    }
    const username = req.body.username

    const userExists = await User.findOne({ username: username })

    if (userExists) {
        return res.status(411).json("User already exists")
    }

    try {
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        })

        const userId = newUser._id
        const token = jwt.sign({ userId }, JWT_SECRET_KEY)

        //add random balance amount upon user sign up
        await Account.create({
            userId: userId,
            username: username,
            balance : Math.random() * 10000
        })

        return res.json({
            msg: "Post request successful",
            token: token,
            userId: userId,
            username: username,
        })
    }
    catch (err) {
        console.log(err)
        res.json({
            msg: "User could not be created"
        })
    }

})

const signinBody = z.object({
    username: z.string().email(),
    password: z.string().min(6)
})
//we dont use authMiddleware during signin. Only for get requests for different routes after signing in to the page
router.post("/signin", async (req, res) => {
    const result = signinBody.safeParse(req.body)

    if (!result.success) {
        return res.status(411).json({
            message: "Email Already taken / Incorrect Inputs"
        })
    }

    const username = req.body.username;

    const user = await User.findOne({
        username: username,
        password: req.body.password
    })

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET_KEY);

        return res.json({
            userId: user._id,
            username: username,
            token: token,
            message: "Successfully signed in"
        })
    }

    res.status(411).json({
        msg: "Error while logging in"
    })

})

const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
})
//to update password/firstname/lastname
router.put("/", authMiddleware, async (req, res) => {
    const result = updateBody.safeParse(req.body)
    if (!result.success) {
        res.json({
            msg: "Validation Failed"
        })
    }

    const updatedUser = await User.updateOne(
        { _id: req.userId }, req.body
    )

    res.json({
        updated: updatedUser,
        msg: "Updated Successfully"
    })
})

//to search for other users 
router.get("/bulk", authMiddleware, async (req, res) => {
    const filter = req.query.filter || "";

    try {
        const users = await User.find({
            $or: [{firstName: {"$regex": filter, "$options": "i"}}, 
            {lastName: {"$regex": filter, "$options": "i"}}]
        })

        res.json({
            user: users.map(user => ({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        })
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
})


module.exports = router;