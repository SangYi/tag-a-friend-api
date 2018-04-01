require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex')

const PORT = process.env.PORT || 3005;
const register = require('./controllers/register');
const login = require('./controllers/login');
const image = require('./controllers/image');

const db = knex({
    client: 'pg',
    connection: {
        host : process.env.DB_HOST,
        user : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : 'test'
    }
});

const app = express();

app.use(cors())
app.use(bodyParser.json());

app.get('/', (rep, res) => { res.send('This is working') });
app.post('/register', register.handleRegister(db, bcrypt));
app.post('/login', login.handleLogin(db, bcrypt));

// app.post('/imageurl', image.handleApiCall);
app.post('/imageurl', image.handleImageSubmit(db));
app.get('/photos/:userId', image.getPhotos(db));
app.put('/photos/:faceId', image.handleEnterName(db));
app.post('/testregister', register.handleRegister(db, bcrypt));

//---------
app.get('/api', (req, res) => {
    res.json({
        message: "welcome to the API"
    });
});
app.post('/api/posts', veriftyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            console.log(err)
            res.sendStatus(403);
        } else {
            res.json({
                message: 'Post created...',
                authData
            });
        }
    });
});
app.post('/api/login', (req, res) => {
    //stuff happened here and got user back
    const user = {
        id: 1,
        username: 'sang',
        email: 'sang@gmail.com'
    }
    jwt.sign({user}, 'secretkey', /*{expiresIn: '30s'},*/ (err, token) => {
        res.json({
            token
        });
    });
});

//FORMAT OF TOKEN
//Authorization : Bearer <access_token>
//Verifty Token
function veriftyToken(req, res, next) {
    //Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(bearerHeader) {
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next()
    } else {
        // Forbidden
        res.sendStatus(403)
    }
}
//---------
app.listen(PORT, ()=> {
    console.log(`App is running on port ${PORT}`);
});

/*
/ --> res = this is working
/login --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user
*/