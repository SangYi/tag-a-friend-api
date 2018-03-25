const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex')

const PORT = 3005;
const register = require('./controllers/register');
const login = require('./controllers/login');
const image = require('./controllers/image');

const db = knex({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : 'yellow45',
        database : 'smart-brain'
    }
});

const app = express();

app.use(cors())
app.use(bodyParser.json());

app.get('/', (rep, res) => { res.send('This is working') });
app.post('/register', (req, res) => {
    res.json('Registered');
});
// app.post('/register', register.handleRegister);
app.post('/login', (req, res) => {
    console.log('Logged in');
    res.json(req.body);
});
// app.post('/login', login.handlelogin);

app.post('/imageurl', image.handleApiCall)

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