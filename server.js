require('dotenv').config()
const express = require('express');
const cors = require('cors')
const morgan = require('morgan')
const db = require('./database/connection')
var cookieParser = require('cookie-parser');
db()
const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))
app.use(cookieParser());

const port = process.env.PORT

app.get('/',(req,res)=>{
    res.send('hello')
})

app.use('/api',require('./router/router'))

app.listen(port,()=>{
    console.log(`server connect to http://localhost:${port}`)
})