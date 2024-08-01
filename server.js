if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const expressLayout = require('express-ejs-layouts')
const mongoose = require('mongoose')

const indexRouter = require('./routes/index')

const app = express()

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayout)
app.use(express.static( __dirname + '/public'))

mongoose.connect(process.env.DB_URL, {useNewUrlParser:true})
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', ()=>console.log('Connected to Mongo-DB'))

app.use('/', indexRouter)

const PORT = process.env.PORT || 3050;
app.listen(PORT, ()=>{
    console.log('============================================');
    console.log(`The web server is tarted at port : ${PORT}`)
    console.log('============================================');
})