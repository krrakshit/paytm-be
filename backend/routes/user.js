const express = require("express");
const zod = require("zod")
const router = express.Router();
const { User, Account } = require("../db")
const JWT_SECRET = require("../config")
const jwt = require("jsonwebtoken")
const { authmiddleware } = require("../middleware");
const { default: mongoose } = require("mongoose");

const signupbody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstname: zod.string(),
    lastname: zod.string()
})

router.post("/signup", async (req, res) => {
    const sucess = signupbody.safeParse(req.body)
    if (!sucess) {
        return res.status(411).json({
            message: "Incorrect inputs, Email already taken"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/incorrect inputs"
        })
    }
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstname,
        lastName: req.body.lastname
    })

    const userId = user._id;
    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        message: "User created successfully",
        token: token
    })
})

const signinbody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin", async (req, res) => {
    const { success } = signinbody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "incorretc inputs"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET)


        res.json({
            token: token
        })
        return;
    }

    res.status(411).json({
        mmessage: "Error while logging in "
    })
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstname: zod.string().optional(),
    lastname: zod.string().optional()
})
router.put("/", authmiddleware, async (req, res) => {
    const { sucess } = updateBody.safeParse(req.body)
    if (!sucess) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne(req.body, {
        _id: req.userId
    })

    res.json({
        message: "Upadted sucessfully"
    })
})


router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;



