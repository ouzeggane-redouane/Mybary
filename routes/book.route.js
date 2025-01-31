const express = require('express')
const path = require('path')

const router = express.Router();

const Book = require('../models/book.model');
const Author = require('../models/author.model');


const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//All books route
router.get('/', async (req, res) => {
    let query = Book.find();
    
    if (req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }

    if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lgte('publishDate', req.query.publishedBefore)
    }

    if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }

    try {
        const books = await query.exec();

        const searchOptions = req.query;
    
        res.render('books/index.ejs', {books, searchOptions})
    }
    catch (err){
        res.redirect('/')
    }
})

//New book form route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

//Create a new book route
router.post('/', async (req, res) => {
    const book = new Book({
        title : req.body.title,
        author : req.body.author,       
        publishDate : new Date(req.body.publishDate),
        pageCount:req.body.pageCount,
        description:req.body.description
    });
    saveCover(book, req.body.cover);

    try{
        const newBook = await book.save();
        // res.redirect( `books/${newBook.id}` );
        res.redirect( `books` );
    }
    catch (err){
        renderNewPage(res, book, true);
    }
})

async function renderNewPage(res, book, hasError = false){
    try {
        const authors = await Author.find({}) 
        const params = { 
            book : book, 
            authors : authors 
        }

        if (hasError){
            params.errorMessage = 'Error creating book';
        }

        res.render('books/new.ejs',  params);
    } catch (error) {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded){
    if (coverEncoded == null){
        return;
    }

    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

module.exports = router;