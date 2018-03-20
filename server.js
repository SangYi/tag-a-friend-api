const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex')

const PORT = 3005;

const app = express();

app.use(cors())
app.use(bodyParser.json());


const db = knex({
    client: 'pg',
    connection: {
    host : '127.0.0.1',
    user : 'aneagoie',
    password : '',
    database : 'smart-brain'
    }
});

app.get('/', (rep, res) => {
    res.send('This is working');
});

app.post('/signin', (req, res) => {
    res.json('Signed in');
});

app.listen(PORT, ()=> {
    console.log(`App is running on port ${PORT}`);
});

/*
/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user
*/