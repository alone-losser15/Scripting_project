// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars').create();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

app.engine('handlebars', exphbs.engine);
app.set('view engine', 'handlebars'); 

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
    console.log(req.body)
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
            console.log(" User Password: "+user.password)
            console.log(" Input Password: "+password)
            /* return res.status(200).json({ authenticated: true, message: 'Authentication successful' }); */

            // Render the homepage with the username
            return res.render('home', { username });
        } else {
            console.log('Authentication failed');
            return res.status(401).json({ authenticated: false, message: 'Authentication failed' });
        }
    } catch (err) {
        console.error('Error authenticating user:', err);
        return res.status(500).json({ authenticated: false, message: 'Internal server error' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
