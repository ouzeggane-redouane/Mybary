const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router();

const Book = require('../models/book.model');
const Author = require('../models/author.model');

const uploadPath = path.join( 'public', Book.coverImageBasePath );
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

const upload = multer({
    dest:uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype) );
    }
})

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
router.post('/', upload.single('cover') , async (req, res) => {
    const filename = req.file != null ? req.file.filename : null;

    const book = new Book({
        title : req.body.title,
        author : req.body.author,       
        publishDate : new Date(req.body.publishDate),
        pageCount:req.body.pageCount,
        coverImageName : filename,
        description:req.body.description
    });

    try{
        const newBook = await book.save();
        // res.redirect( `books/${newBook.id}` );
        res.redirect( `books` );
    }
    catch (err){
        if (book.coverImageName != null) {
            removeBookCoverImage( book.coverImageName );
        }

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

function removeBookCoverImage(filename){
    fs.unlink( path.join(uploadPath, filename) ,  err => {
        if (err){
            console.error(err);
        }
    } );
}

module.exports = router;