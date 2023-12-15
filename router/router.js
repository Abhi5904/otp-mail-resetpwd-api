const express = require('express');
const { register, login, getuser, generateOTP, verifyOTP, createResetSession, resetPassword ,updateuser, loginWithMail, verifyOTPAndFetchUser} = require('../controller/auth');
const { fetchuser,verifyLocalveriable,sendMail, sendOTPMail } = require('../middleware/auth');
const router = express.Router()

router.post('/register',sendMail,register)
    .post('/authenticate')
    .post('/login',login)
    .post('/login-email',sendOTPMail,loginWithMail)
    .get('/verifyOTP-email',fetchuser,verifyOTPAndFetchUser)
    .get('/user/:id',getuser)
    .get('/generateOTP',fetchuser,verifyLocalveriable,generateOTP)
    .get('/verifyOTP',verifyOTP)
    .get('/createResetSession',createResetSession)
    .put('/updateuser/:id',fetchuser,updateuser)
    .put('/resetPassword',fetchuser,resetPassword)

module.exports = router