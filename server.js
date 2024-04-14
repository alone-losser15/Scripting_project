// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// Load environment variables
require('dotenv').config();

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/BookReviewForum';

// Create a Mongoose schema for the user data
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String
});

// Create a Mongoose model based on the schema
const User = mongoose.model('User', userSchema);

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit with failure
});

// Use bodyParser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle POST request from sign-up form
app.post('/signup', async (req, res) => {
    // Extract user information from the request body
    const { name, email, username, password } = req.body;

    try {
        // Create a new user instance
        const newUser = new User({ name, email, username, password });

        // Save the new user to the database
        await newUser.save();

        console.log('User saved to database:', newUser);
        res.redirect('/login'); // Redirect to login page after successful signup
    } catch (err) {
        console.error('Error saving user to database:', err);
        res.sendStatus(500); // Internal server error
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
