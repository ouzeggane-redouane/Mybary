const express = require('express')
const router = express.Router();

const Book = require('../models/book.model');

router.get('/', async (req, res) => {
    let books;

    try{
        books = await Book.find().sort({createdAt: 'desc'}).limit(10);
    }
    catch(err){
        books = []
    }

    res.render('index.ejs', {books})
})

module.exports = router;