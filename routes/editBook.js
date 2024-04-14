
const express = require('express');
const Book = require('../models/book');
const router = express.Router();

console.log("PASSED EDIT BOOK ROUTE")
// Handle POST request to edit a book
router.post('/', async (req, res) => {
    try {
        console.log("Req Body: "+req.body);
        const { bookId, editBookName, editAuthors, editPublishedYear, editGenres, editBookTagline } = req.body;

        // Find the book by ID
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Update book fields
        book.bookName = editBookName;
        book.authors = editAuthors.split(',').map(author => author.trim());
        book.publishedYear = editPublishedYear;
        book.genres = editGenres.split(',').map(genre => genre.trim());
        book.bookTagline = editBookTagline;

        // Save the updated book
        await book.save();

        res.status(200).send('Book updated successfully');
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;
