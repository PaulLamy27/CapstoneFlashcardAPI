const express = require("express");
const db = require("../db_config");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get("/search/:firstName/:lastName/:username/:email", cors(), async (req, res) => {
    try {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Access-Control-Allow-Credentials", true);
        const firstname = req.params.firstname ?? "";
        const lastname = req.params.lastname ?? "";
        const username = req.params.username ?? "";
        const email = req.params.email ?? "";
        const sql = `SELECT id, firstName, lastname, username, email FROM user WHERE firstName LIKE '${firstname}%' AND lastname LIKE '${lastname}%' AND username LIKE '${username}%' AND email LIKE '${email}%'`;
        db.query(sql, (error, results) => {
            if (error) {
                console.log(
                    "The followin error occured at deck /:id AFTER the Query : ",
                    error
                );
                res.status(500).json({ message: "Error occured Inside of Query" });
            } else {
                const extractedResults = results.map((row) => ({
                    id: row.id,
                    firstname: row.firstName,
                    lastname: row.lastname,
                    username: row.username,
                    email: row.email,
                }));
                res.json(extractedResults);
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error" }).end();
    }
});

router.post('/change-password', (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    // Retrieve user's current password from the database
    db.query('SELECT password FROM user WHERE id = ?', [userId], (error, results, fields) => {
        if (error) {
            console.error('Error retrieving user password:', error);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ message: 'User not found' });
            } else {
                const hashedPassword = results[0].password;

                // Compare the user's current password with the one stored in the database
                bcrypt.compare(currentPassword, hashedPassword, (err, passwordMatch) => {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        res.status(500).json({ message: 'Internal server error' });
                    } else {
                        if (!passwordMatch) {
                            res.status(401).json({ message: 'Incorrect current password' });
                        } else {
                            // Hash the new password before storing it in the database
                            bcrypt.hash(newPassword, 10, (hashErr, hashedNewPassword) => {
                                if (hashErr) {
                                    console.error('Error hashing new password:', hashErr);
                                    res.status(500).json({ message: 'Internal server error' });
                                } else {
                                    // Update the user's password in the database
                                    db.query('UPDATE user SET password = ? WHERE id = ?', [hashedNewPassword, userId], (updateErr, updateResults, updateFields) => {
                                        if (updateErr) {
                                            console.error('Error updating password:', updateErr);
                                            res.status(500).json({ message: 'Internal server error' });
                                        } else {
                                            console.log('Password updated successfully');
                                            res.status(200).json({ message: 'Password updated successfully' });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});

router.post('/change-username', (req, res) => {
    const { userId, newUsername } = req.body;

    db.query('SELECT username FROM user WHERE id = ?', [userId], (error, results, fields) => {
        if (error) {
            console.error('Error retrieving user password:', error);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ message: 'User not found' });
            } else {
                db.query('UPDATE user SET username = ? WHERE id = ?', [newUsername, userId], (updateErr, updateResults, updateFields) => {
                    if (updateErr) {
                        console.error('Error updating username:', updateErr);
                        res.status(500).json({ message: 'Internal server error' });
                    } else {
                        console.log('Username updated successfully');
                        res.status(200).json({ message: 'Username updated successfully' });
                    }
                });
            }
        }
    });
});

module.exports = router;