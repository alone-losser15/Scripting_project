const express = require('express');
const Book = require('../models/book');
const Genre = require('../models/genre');
const router = express.Router();
const multer = require('multer');

// Define storage for the images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/book_Covers/');
    },
    filename: function (req, file, cb) {
        const fileNameParts = file.originalname.split('.');
        const extension = fileNameParts.pop();
        const originalFileName = fileNameParts.join('.');
        const newName = `${originalFileName}-${req.body.authors.split(',')[0]}-${req.body.authors.split(',')[1]}.${extension}`;
        cb(null, newName);
    }
});

// Initialize multer upload
const upload = multer({ storage: storage });

router.post('/', upload.single('bookCoverFile'), async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        const { bookName, authors, publishedYear, genres, bookTagline, bookCoverURL } = req.body;
        let bookCoverPath = '';

        if (req.file) {
            bookCoverPath = `/uploads/book_Covers/${req.file.filename}`;
        } else if (bookCoverURL) {
            // Handle bookCoverURL separately if provided
            bookCoverPath = bookCoverURL;
        }

        console.log('bookCoverPath:', bookCoverPath);

        const newBook = new Book({
            bookName,
            authors: authors.split(',').map(author => author.trim()),
            publishedYear,
            genres: genres.split(',').map(genre => genre.trim()),
            bookTagline,
            bookCoverPath
        });

        await newBook.save();
        
        // Show alert after book is saved
        res.send('<script>alert("Book added successfully"); window.history.back();</script>');
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).send('Internal Server Error');
    }
});




router.get('/',async  (req, res) => {
    const genres = await Genre.find().lean();
    res.render('addBook', { genres }); // Assuming you have a handlebars template for the form
});

module.exports = router;
