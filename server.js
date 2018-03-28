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
        host : '127.0.0.1',
        user : 'postgres',
        password : 'yellow45',
        database : 'test'
    }
});

const app = express();

app.use(cors())
app.use(bodyParser.json());

app.get('/', (rep, res) => { res.send('This is working') });
app.post('/register', (req, res) => {
    console.log('Registered')
    res.json(req.body);
});
// app.post('/register', register.handleRegister);
app.post('/login', (req, res) => {
    console.log('Logged in');
    res.json(req.body);
});
// app.post('/login', login.handlelogin);

app.post('/imageurl', image.handleApiCall)

app.post('/testregister', (req, res) => {
    const {email, username, name, password} = req.body;
    const hash = bcrypt.hashSync(password)
    //temp
    db.transaction(trx => {
        trx('login').insert({
            hash,
            email,
            username
        }, 'email')
        .then( ([loginEmail]) => {
            console.log(loginEmail);
            return trx('account')
                .insert({
                    email: loginEmail,
                    // name,
                    username,
                    created_on: new Date()
                }, '*')
                .then( ([user]) => {
                    console.log(user)
                    res.json(user)
                })
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch(err => res.status(400).json({
        message: 'unable to register',
        err
    }))
})
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
    jwt.sign({user}, 'secretkey', {expiresIn: '30s'}, (err, token) => {
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