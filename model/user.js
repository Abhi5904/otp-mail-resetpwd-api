const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
    username: { type: String, required: true, unique:true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String },
    token: { type: String, required: true }
})

module.exports = mongoose.model('user', UserSchema)