
const express = require('express');
const Book = require('../models/book');
const User = require('../models/user');
const Review = require('../models/reviews');
const router = express.Router();

var reviewerEmailsCopy = "";
router.get('/:bookId', async (req, res) => {
    const { bookId } = req.params;
    try {
        // Find the book by its ID
        const book = await Book.findOne({ _id: bookId }).lean();
        if (!book) {
            return res.status(404).send('Book not found');
        }

        const user = await User.findOne({ email: req.session.email });
        const userId = user._id;

        // Fetch all reviews for the book
        const reviews = await Review.find({ bookId: book._id }).populate('reviewerId').lean();
        /* console.log("REVIEWS: " + reviews) */
        

        res.render('reviewPage', { book, reviews, userId, email: req.session.email });

    } catch (err) {
        console.error('Error fetching book:', err);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/publish-review', async (req, res) => {
    const { bookName, reviewerName, reviewerEmail, review, bookId } = req.body;
   
/*     console.log("bookId: " + bookId, "reviewerEmail: " + reviewerEmail, "review: " + review, "reviewerName: " + reviewerName)
 */    try {
        // Find the book by ID
        let book = await Book.findOne({ _id: bookId });

        if (!book) {
            return res.status(404).send('Book not found');
        }

        const user = await User.findOne({ email: reviewerEmail });
        // Create a new Review instance with an empty likedBy array
        const newReview = new Review({
            bookId: bookId,
            reviewText: review,
            reviewDate: new Date(),
            reviewerId: user._id,
            likedBy: [] // Initialize likedBy as an empty array
        });

        // Save the new review to the 'reviews' collection
        await newReview.save();

        // Add the book's ID to the user's reviewedBooks array
        if (!user.reviewedBooks.includes(bookId)) {
            user.reviewedBooks.push(bookId);
            await user.save();
        }
        res.redirect(req.headers.referer || '/');

    } catch (err) {
        console.error('Error saving review to database:', err);
        res.sendStatus(500); // Internal server error
    }
});



// In your reviews.js file
router.post('/like/:reviewId', async (req, res) => {
    const { reviewId } = req.params;

    try {
        // Find the review in the 'reviews' collection
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).send('Review not found');
        }

        // Check if the user's email is already in the likedBy array
        const alreadyLiked = review.likedBy.includes(req.session.email);

        // Toggle like status
        if (alreadyLiked) {
            // Remove user's email from likedBy array
            review.likedBy = review.likedBy.filter(email => email !== req.session.email);
        } else {
            // Add user's email to likedBy array
            review.likedBy.push(req.session.email);
        }

        // Save the updated review
        await review.save();

        res.status(200).json({ liked: !alreadyLiked, likeCount: review.likedBy.length }); // Return whether the review was liked or unliked
    } catch (err) {
        console.error('Error updating like status:', err);
        res.sendStatus(500); // Internal server error
    }
});


router.delete('/delete/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    
    try {
        // Find the review by ID and delete it
        const result = await Review.deleteOne({ _id: reviewId });
        
        if (result.deletedCount === 1) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        res.sendStatus(500);
    }
});

router.post('/add-to-favourites/:bookId', async (req, res) => {
    const { bookId } = req.params;
    try {
        // Find the user by email and update the likedBooks array
        const updatedUser = await User.findOneAndUpdate(
            { email: req.session.email },
            { $addToSet: { likedBooks: bookId } }, // Use $addToSet to prevent duplicate entries
            { new: true } // Return the updated document
        );
        res.status(200).json({ message: 'Book added to favourites', user: updatedUser });
    } catch (error) {
        console.error('Error adding book to favourites:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




module.exports = router;
