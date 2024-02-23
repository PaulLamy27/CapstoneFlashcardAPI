const express = require('express');
const db = require('../db_config');
const app = express();
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); ``

router.post('/login', cors(), async (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    const sql = 'SELECT * FROM user WHERE email = ?';
    db.query(sql, [req.body.email], (err, data) => {
        if (err) return res.json({ Error: "Login error in server" });
        if (data.length > 0) {
            if (req.body.password === data[0].password) {
                const name = data[0].id;
                const name1 = data[0].username;
                console.log(name1);
                const token = jwt.sign({ id: name }, "jwt-secret-key", { expiresIn: "1d" });
                res.cookie('token', token, {
                    secure: true,
                    httpOnly: true,
                    sameSite: 'lax'
                });
                return res.json({ Status: "Success", username: name1 });
            }
            else {
                return res.json({ Error: "Password not matched" });
            }
        }
        else {
            return res.json({ Error: "No email existed" });
        }
    })
})

module.exports = router;