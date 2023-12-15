const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
const User = require('../model/user');
const { extractNameFromEmail } = require('../utils/function');
const otpGenerator = require('otp-generator')


exports.fetchuser = async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization
        const token = bearerToken.split(' ')[1]
        if (!token) return res.status(401).send({ msg: "No Token Provided" })
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                console.log(err)
                return res.status(400).json({ error: err })
            } else {
                req.user = decoded.user
                next()
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal server error')
    }
}

exports.verifyLocalveriable = (req, res, next) => {
    req.app.locals = {
        OTP: null,
        resetSession: false
    }
    next()
}

exports.sendMail = async (req, res, next) => {
    const { username, email } = req.body

    const user = await User.findOne({ username })
    if (user) {
        return res.status(409).json('username already exists. please try another username')
    }

    const checkemail = await User.findOne({ email })
    if (checkemail) {
        return res.status(409).json('email already exists. please try another email')
    }

    let config = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    }

    let transporter = nodemailer.createTransport(config)

    const response = `
    <p>Dear ${username},</p>
    <p>Congratulations! You have successfully registered with Nodemailer.</p>
    <p>Welcome aboard! We're excited to have you as a part of our community.</p>
    <p>Feel free to explore Nodemailer and enjoy our services.</p>
    <p>Thank you for choosing Nodemailer!</p>
    <br>
    <p>Best regards,<br>Nodemailer Team</p>`

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Registration Successful - Welcome to Nodemailer',
        html: response
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(400).json({ error: "Error in send a mail" })
        } else {
            console.log('Email sent:', info.response);
            next()
        }
    })
}

exports.sendOTPMail = async (req, res, next) => {
    const { email } = req.body
    const emailcheck = await User.findOne({ email })
    if (!emailcheck) {
        return res.status(400).json("email not found")
    }
    let config = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    }

    let transporter = nodemailer.createTransport(config)

    const username = extractNameFromEmail(email)
    const OTP = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
    res.cookie("OTP", OTP, { maxAge: 60000 })
    const response = `
    <p>Dear ${username},</p>
    <p>Your One-Time Password (OTP) for account verification is:</p>
    <h2>${OTP}</h2>
    <p>Please use this OTP to complete the registration process.</p>
    <p>If you did not initiate this request, please ignore this email.</p>
    <br>
    <p>Best regards,<br>Nodemailer Team</p>`

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'OTP for Account Verification - Nodemailer',
        html: response
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(400).json({ error: "Error in send a mail" })
        } else {
            console.log('Email sent:', info.response);
            req.user = emailcheck
            next()
        }
    })
}

exports.f