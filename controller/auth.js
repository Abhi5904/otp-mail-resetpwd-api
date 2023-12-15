const User = require('../model/user')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const otpGenerator = require('otp-generator')
const mongoose = require('mongoose')

/*  Mthod : POST localhost:303-/api/register
    body :   "username" : "example123",
    "password" : "admin123",
    "email": "example@gmail.com",
*/
exports.register = async (req, res) => {
    const { username, email, password, imageUrl } = req.body

    try {
        if (password) {
            const hashedPWD = await bcrypt.hash(password, 10)
            const token = JWT.sign({ user: email }, process.env.JWT_SECRET, { expiresIn: '20m' })
            const user = new User({
                username,
                password: hashedPWD,
                email,
                imageUrl: imageUrl || '',
                token: token
            })

            const data = await user.save()

            return res.status(201).json({ message: "User Register successfully", data: data })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal server error')
    }
}

/*  Methos : POST localhost:303-/api/login
    body:"username" : "example123",
    "password" : "admin123",
*/

exports.login = async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(400).json("Username not found")
        }
        const pwd = await bcrypt.compare(password, user.password)
        const token = JWT.sign({ user: user.email }, process.env.JWT_SECRET, { expiresIn: '20m' })
        // await User.findOneAndUpdate({username:user.username},{token:token})
        user.token = token
        if (pwd) {
            return res.status(200).json({ message: "Login successfully", data: user })
        } else {
            return res.status(401).json("Password invalid")
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal server error')
    }
}

exports.loginWithMail = async (req, res) => {
    try {
        const token = JWT.sign({ user: req.user.email }, process.env.JWT_SECRET, { expiresIn: '20m' })
        req.user.token = token
        return res.status(200).json({ message: "OTP send successfully", token: req.user.token })
    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal server error')
    }
}

/* Method : GET localhost:303-/api/user/:id */

exports.getuser = async (req, res) => {
    const id = req.params.id
    try {
        var isValid = mongoose.Types.ObjectId.isValid(id)
        if (!isValid) {
            return res.status(404).json('Invalid User id')
        }
        const user = await User.findById(id, { password: 0 })
        if (!user) {
            return res.status(404).json('No user with this ID')
        }
        return res.status(200).send(user)
    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal server error')
    }
}


/* Method : PUT localhost:3030/api/updateuser/:id
    body :   "username" : "example123",
    "password" : "admin123",
    "email": "example@gmail.com",
*/

exports.updateuser = async (req, res) => {
    const id = req.params.id
    try {
        var isValid = mongoose.Types.ObjectId.isValid(id)
        if (!isValid) {
            return res.status(404).json('Invalid User id')
        }
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json('user not found')
        }
        const data = await User.findByIdAndUpdate({ _id: id }, req.body, { new: true })
        return res.status(201).json({ data: data, message: "user data updated" })
    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal server error')
    }
}

/* Method : GET localhost:303-/api/generateOTP*/
exports.generateOTP = (req, res) => {
    req.app.locals.OTP = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
    return res.status(200).json({ code: req.app.locals.OTP })
}

/* Method : GET localhost:303-/api/verifyOTP */
exports.verifyOTP = (req, res) => {
    const { code } = req.query
    console.log(req.app.locals.OTP)
    if (parseInt(code) === parseInt(req.app.locals.OTP)) {
        req.app.locals.OTP = null
        req.app.locals.resetSession = true
        return res.status(201).json({ message: "verify successfully" })
    }
    return res.status(400).json({ error: "Invalid OTP" })
}

exports.verifyOTPAndFetchUser = async (req, res) => {
    const { code } = req.query
    if (parseInt(code) === parseInt(req.cookies.OTP)) {
        res.clearCookie('OTP')
        const user = req.user
        const usercheck = await User.findOne({ user })
        if (usercheck) return res.status(201).json({ message: "Login successfully", data: usercheck })
        else return res.status(401).json({ error: "error in verify otp" })
    }
    return res.status(400).json({ error: "Invalid OTP" })
}

/* Method : GET localhost:303-/api/createResetSession */
exports.createResetSession = (req, res) => {
    if (req.app.locals.resetSession) {
        req.app.locals.resetSession = false
        return res.status(200).json({ message: "access granted" })
    }
    return res.status(440).json({ error: "Session expired" })
}

/* Method : PUT localhost:303-/api/resetPassword */
exports.resetPassword = async (req, res) => {
    try {
        if (!req.app.locals.resetSession) return res.status(440).json({ error: "Session expired" })
        const { password } = req.body
        console.log(req.user)
        const user = await User.findOne({ email: req.user })
        if (!user) return res.status(404).json({ error: "user not found" })
        const hashedPWD = await bcrypt.hash(password, 10)
        if (password) {
            await User.updateOne({ username: user.username }, { password: hashedPWD })
            req.app.locals.resetSession = false;
            return res.status(200).json({ message: "password updated" })
        } else {
            return res.status(404).json({ error: "password not found" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal server error')
    }
}
