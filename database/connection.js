const mongoose = require('mongoose');

const db = ()=>{
    mongoose.set('strictQuery',true)
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>console.log('database connected'))
    .catch((err)=>console.log(`some error ocuured when server connect to database :${err}`))
}
module.exports = db