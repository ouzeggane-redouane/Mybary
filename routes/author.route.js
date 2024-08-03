const express = require('express')
const router = express.Router();

const Author = require('../models/author.model');

//All authors route
router.get('/', async (req, res) => {
    let searchOptions = {};
    let name = '';
    if (req.query.name != null && req.query.name != ''){
        searchOptions.name = new RegExp( req.query.name, 'i' );
    }

    try{
        const authors = await Author.find(searchOptions)
        res.render( 'authors/index' , {
            authors, 
            searchOptions:name
        });
    }
    catch(err){
        console.log(err)
        res.redirect('/')
    }
})

//New author form route
router.get('/new', (req, res) => {
    res.render( 'authors/new' , {author: new Author()} );
})

//Create a new author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    try{
        const newAuthor = await author.save();

        // res.redirect( `authors/${newAuthor.id}` );
        res.redirect( `authors` );
    }
    catch(err){
        res.render('authors/new', {author, errorMessage:'Error creating Author !!!'})
    }
})

module.exports = router;