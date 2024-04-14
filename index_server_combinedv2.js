const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const exphbs = require('express-handlebars').create();

const Book = require('./models/book');
const Genre = require('./models/genre');
const User = require('./models/user');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

app.engine('handlebars', exphbs.engine);
app.set('view engine', 'handlebars'); 

// Load environment variables
require('dotenv').config();

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/BookReviewForum';

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

// Use session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Use bodyParser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), { 
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Handle GET request for login and signup pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup', 'signup.html'));
});



// Handle POST request from sign-up form
app.post('/signup', async (req, res) => {
    // Extract user information from the request body
    const { name, email, username, password } = req.body;

    try {
        console.log('Received sign-up request for:', username);

        // Log the password from the request
        console.log('Password from request:', password);

        

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

// Handle POST request for user authentication
app.post('/authenticate', async (req, res) => {
    // Extract username and password from the request body
    const { username, password } = req.body;

    try {
        // Find user by username in the database
        const user = await User.findOne({ username });
        
        // If user is not found, send authentication failed response
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ authenticated: false, message: 'Authentication failed' });
        }

        // Compare the passwords
        if (user.password === password) {
            console.log('Authentication successful');
            // Store the username in the session
            req.session.username = username;
            // Redirect to the homepage
            return res.redirect('/home');
        } else {
            console.log('Authentication failed');
            return res.status(401).json({ authenticated: false, message: 'Authentication failed' });
        }
    } catch (err) {
        console.error('Error authenticating user:', err);
        return res.status(500).json({ authenticated: false, message: 'Internal server error' });
    }
});

// Handle GET request for the homepage
app.get('/home', async (req, res) => {
    try {
        // Retrieve the username from the session
        const username = req.session.username;
        if (!username) {
            // Redirect to the login page if username is not found in the session
            return res.redirect('/login');
        }

        

        // Retrieve genre data from MongoDB
        const genres = await Genre.find({}).lean();
        console.log('Genres:', genres);

        // Render the homepage with the username and genre data
        res.render('home', { username, genres });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Utility function to format genre name
function formatGenreName(genreName) {
    // Remove hyphens and capitalize first letter of every word
    return genreName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

app.get('/site-logo.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'site-logo.jpg'));
});

// Handle GET request for books of a specific genre
app.get('/genre/:genreName', async (req, res) => {

    const { genreName } = req.params;
    const formattedGenreName = formatGenreName(genreName); // Format the genre name

    try 
    {
        // Query the database for books where the genres array includes the formatted genre name
        const books = await Book.find ( { genres: { $in: [formattedGenreName ] }  } ).lean();

        // Render a page displaying the details of the books
        res.render('genre_menu', { books });
    } 
    catch (err) {
        console.error('Error fetching books:', err);
        res.sendStatus(500); // Internal server error
    }
});


// Assuming you have already defined your Book model and connected to MongoDB

// Define a route handler for /reviews/:bookName
app.get('/reviews/:bookName', async (req, res) => {
    const { bookName } = req.params;

    try {
        // Find the book in the database by its name
        var book = await Book.findOne({ bookName }).lean();
       
        console.log("Book Name:"+bookName);
        console.log("Book:", book)

        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Assuming you have a reviews field in your book schema
        const reviews = book.reviews || [];

        console.log("Reviews:", reviews)

        if (book.reviews.length > 0) {
            book = await Book.populate(book, { path: 'reviews.reviewerName' });
        }

        // Render the reviews page with the book and its reviews
        res.render('reviewPage', { book });
    } catch (err) {
        console.error('Error fetching book:', err);
        res.status(500).send('Internal Server Error');
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
