const express = require('express');
const db = require('../db_config');
const app = express();
const router = require('express').Router();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const saltRounds = 10;

router.get('/', async (req, res) => {
    try {
        res.json({ message: "Hello world from registration /!!!!!" })
    } catch (error) {
        console.log("The followin error occured at deck / : ", error);
    }
});


router.post('/create', async (req, res) => {

    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    const { firstname, lastname, email, username, password } = req.body;
    console.log("firstname: ", firstname);
    console.log("password: ", password);
    if (firstname && lastname && email && username && password) {
        console.log('Request received');
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            db.connect(function (err) {
                db.query('INSERT INTO user (firstname, lastname, email, username, password) VALUES (?, ?, ?, ?, ?)',
                    [firstname, lastname, email, username, hashedPassword],
                    function (err, result, fields) {
                        if (err) {
                            console.log(err);
                            res.send(err);
                        }
                        if (result) {
                            res.send("success");
                            console.log("success");
                        }
                        if (fields) console.log(fields);
                    });
            });
        } catch (error) {
            console.error('Error hashing password:', error);
            res.status(500).send('Internal Server Error');
        }

    } else {
        console.log('Missing a parameter');
        res.status(400).send('Bad Request: Missing a parameter');
    }
});

module.exports = router;