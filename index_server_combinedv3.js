const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const exphbs = require('express-handlebars').create();
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/BookReviewForum', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});

app.engine('handlebars', exphbs.engine);
app.set('view engine', 'handlebars');

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        };
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/home', require('./routes/home'));
app.use('/genre', require('./routes/genre'));
app.use('/reviews', require('./routes/reviews'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
