const cors = require('cors');
const db = require('../db_config');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

// pull cards from a deck using deckTitle
router.get('/deckTitle/:deckTitle', async (req, res) => {
    try {
        const deckTitle = req.params.deckTitle;
        console.log(deckTitle);

        const cookie = req.cookies.token;
        const decodedCookie = jwt.verify(cookie, "jwt-secret-key");
        userId = decodedCookie.id;

        // const sql = 'SELECT id, side1, side2, pronunciation, priority FROM cards WHERE deckId = (SELECT id FROM deck WHERE title = ?)'

        // SELECT cards.id, cards.side1, cards.side2, cards.pronunciation, priority.priority as priority FROM cards, priority WHERE priority.cardId = cards.id AND deckId = 31 ORDER BY priority DESC;
        const sql = 'SELECT id, side1, side2, pronunciation, priority FROM cards WHERE deckId = (SELECT id FROM deck WHERE title = ?) ORDER BY id DESC'
        // const sql = `SELECT cards.id, cards.side1, cards.side2, cards.pronunciation, priority.priority FROM cards, priority WHERE priority.cardId = cards.id AND deckId = (SELECT id FROM deck WHERE title = ? AND (userId = ? OR isPublic = 1)) ORDER BY id DESC`;
        db.query(sql, [deckTitle, userId], (error, results) => {
            if (error) {
                console.log("The followin error occured at deck /getcards/:deckTitle AFTER the Query : ", error);
                res.status(500).json({ message: "Error occured Inside of Query" });
            } else {
                const extractedResults = results.map(row => ({
                    id: row.id,
                    side1: row.side1,
                    side2: row.side2,
                    pronunciation: row.pronunciation,
                }));
                res.json(extractedResults);
            }
        });

    } catch (error) {
        console.log("The followin error occured at deck /:deckTitle : ", error);
        res.status(500).json({ message: "Error occured" });
    }
});

// pull cards to study a deck using deckTitle
router.get('/studyDeck/:deckTitle', async (req, res) => {
    try {
        const deckTitle = req.params.deckTitle;
        let userId = ''

        const cookie = req.cookies.token;
        const decodedCookie = jwt.verify(cookie, "jwt-secret-key");
        userId = decodedCookie.id;

        console.log("userId: ", userId);

        // SELECT cards.id, cards.side1, cards.side2, cards.pronunciation, priority.priority as priority FROM cards, priority WHERE priority.cardId = cards.id AND deckId = 31 ORDER BY priority DESC;
        const sql = 'SELECT id, side1, side2, pronunciation, priority FROM cards WHERE deckId = (SELECT id FROM deck WHERE title = ?)';
        //const sql = `SELECT cards.id, cards.side1, cards.side2, cards.pronunciation, priority.priority as priority FROM cards, priority WHERE priority.cardId = cards.id AND deckId = (SELECT id FROM deck WHERE title = ?) ORDER BY priority ASC;`;
        db.query(sql, [deckTitle], (error, results) => {
            if (error) {
                console.log("The followin error occured at deck /getcards/:deckTitle AFTER the Query : ", error);
                res.status(500).json({ message: "Error occured Inside of Query" });
            } else {
                const extractedResults = results.map(row => ({
                    id: row.id,
                    side1: row.side1,
                    side2: row.side2,
                    pronunciation: row.pronunciation,
                }));
                res.json(extractedResults);
            }
        });

    } catch (error) {
        console.log("The followin error occured at deck /:deckTitle : ", error);
        res.status(500).json({ message: "Error occured" });
    }
});

// pull decks that correspond to a user ID
router.get('/user', cors(), async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.header('Access-Control-Allow-Credentials', true);
        const userIdCookie = req.cookies.token;

        if (userIdCookie) {
            console.log("userIdCookie is: ", userIdCookie);
            try {
                const decodedCookie = jwt.verify(userIdCookie, "jwt-secret-key");
                const userId = decodedCookie.id;
                const sql = `SELECT title, isPublic FROM deck WHERE userId = ?`;

                // pass in the SQL query and the deckId, and run a function that with error or results as params
                db.query(sql, [userId], (error, results) => {
                    if (error) {
                        console.log("The followin error occured at deck /:id AFTER the Query : ", error);
                        res.status(500).json({ message: "Error occured Inside of Query" });
                    } else {
                        const extractedResults = results.map(row => ({
                            title: row.title,
                            isPublic: row.isPublic
                        }));
                        res.status(201).json(extractedResults);
                    }
                });
            } catch (error) {
                res.status(500).json({ message: "Error verifying JWT:" }).end();
            }
        } else {
            res.status(500).json({ message: "No userIdCookie" }).end();
        }

    } catch (error) {
        res.status(500).json({ message: "Error occured" }).end();
    }
});

router.post('/prio/:cardId', cors(), async (req, res) => {
    try {
        console.log("we boutta change the priority!");
        res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.header('Access-Control-Allow-Credentials', true);
        //const userId = req.query.userId;
        const cardId = req.params.cardId;

        const userIdCookie = req.cookies.token;

        if (userIdCookie) {
            console.log("userIdCookie is: ", userIdCookie);
            const decodedCookie = jwt.verify(userIdCookie, "jwt-secret-key");

            console.log("decodedCookie: ", decodedCookie);
            const userId = decodedCookie.id;
            console.log("userId AFTER DECODING: ", userId);

            let sql = `UPDATE priority set priority=priority+1 WHERE userId=? AND cardId=?;`;
            let params = [userId, cardId];
            try {
                // db.query(sql, [userId, title], (error, results) => {
                //     if (error) {
                //         console.log("The followin error occured at deck /:id/:title AFTER the Query : ", error);
                //         res.status(500).json({ message: "Error occured Inside of Query" });
                //     } else {
                //         // The query executed successfully
                //         res.json({ message: 'Data inserted successfully' });
                //     }
                // })

                db.query(sql, params, (err, results) => {
                    if (err) {
                        console.log("The followin err occured at deck /prio AFTER db.query: ".err);
                        res.status(500).json({ message: "err occured in query" });
                    }
                    else {
                        console.log("success; priority updated");
                        res.status(201).json({ message: "success; priority updated" });
                    }
                });
            }
            catch (error) {
                console.log("The followin err occured at deck /prio: ".err);
                res.status(500).json({ message: "err occured in /prio:" });
            }
        } else {
            res.status(500).json({ message: "There was no cookies! ):" });
        }
    }
    catch (error) {
        console.log("The followin err occured at deck /prio before anything happened: ".err);
        res.status(500).json({ message: "err occured in /prio:" });
    }
});

router.post('/new/:title', cors(), async (req, res) => {
    console.log("");
    try {
        res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.header('Access-Control-Allow-Credentials', true);
        console.log("req.cookies: ", req.cookies);
        const title = decodeURIComponent(req.params.title);
        console.log("title: ", title);
        const userIdCookie = req.cookies.token;

        if (userIdCookie) {
            console.log("userIdCookie is: ", userIdCookie);
            try {
                const decodedCookie = jwt.verify(userIdCookie, "jwt-secret-key");

                console.log("decodedCookie: ", decodedCookie);
                const userId = decodedCookie.id;
                console.log("userId AFTER DECODING: ", userId);

                const sql = `INSERT INTO deck (userId, title) VALUES (?, ?)`;

                db.query(sql, [userId, title], (error, results) => {
                    if (error) {
                        console.log("The followin error occured at deck /:id/:title AFTER the Query : ", error);
                        res.status(500).json({ message: "Error occured Inside of Query" });
                    } else {
                        // The query executed successfully
                        res.status(201).json({ message: 'Data inserted successfully' });
                    }
                })
            } catch (error) {
                console.error("Error verifying JWT:", error);
                // Handle the error appropriately (e.g., send an error response)
            }
        } else {
            console.log("No userIdCookie ");
        };
    } catch (error) {
        console.log("The followin error occured at deck /new/:title : ", error);
        res.status(500).json({ message: "Error occured" }).end();
    }
})

router.post('/:title/card', async (req, res) => {
    const title = req.params.title;
    const side1 = req.query.side1;
    const side2 = req.query.side2;
    const pronunciation = req.query.pronunciation;
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', true);
    if (side1 && side2 && !pronunciation) {
        try {
            console.log('Request with no pronunciation received');
            let sql = 'INSERT INTO cards (side1, side2, pronunciation, priority, deckId) VALUES (?, ?, NULL, 1, (SELECT id FROM deck WHERE title = ?))';
            let params = [side1, side2, title];

            const result = await new Promise((resolve, reject) => {
                db.query(sql, params, (err, result, fields) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            res.send("success");
            console.log("success");
        } catch (error) {
            console.log("the error has been caught by new card post: ", error);
        }
    } else {
        try {
            console.log('Request received');
            let sql = 'INSERT INTO cards (side1, side2, pronunciation, priority, deckId) VALUES (?, ?, ?, 1, (SELECT id FROM deck WHERE title = ?))';
            let params = [side1, side2, pronunciation, title];

            const result = await new Promise((resolve, reject) => {
                db.query(sql, params, (err, result, fields) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            res.send("success");
            console.log("success");
        } catch (error) {
            console.log("the error has been caught by new card post: ", error);
        }
    }
})

router.post('/:title', async (req, res) => {
    let title = req.params.title;
    let isPublic = req.query.isPublic;
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', true);
    try {
        let cookie = req.cookies.token;
        let decodedCookie = jwt.verify(cookie, "jwt-secret-key");
        let userId = decodedCookie.id;
        let sql = 'UPDATE deck SET isPublic = ? WHERE title = ? AND userId = ?';
        let params = [isPublic, title, userId];
        await new Promise((resolve, reject) => {
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        res.send("success");
    } catch (error) {
        res.sendStatus(500);
    }
})

router.delete('/:title', async (req, res) => {
    const title = req.params.title;

    try {
        res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.header('Access-Control-Allow-Credentials', true);

        const cookie = req.cookies.token;
        const decodedCookie = jwt.verify(cookie, "jwt-secret-key");
        const userId = decodedCookie.id;
        let sql, params;

        // Construct the SQL query based on the provided parameters
        sql = 'DELETE FROM deck WHERE title = ? AND userId = ?';
        params = [title, userId];

        db.query(sql, params, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            // Check if any rows were affected by the delete operation
            if (result.affectedRows > 0) {
                return res.json({ message: 'Deck deleted successfully' });
            } else {
                return res.status(404).json({ message: 'Deck not found or already deleted' });
            }
        });

    } catch (error) {
        console.log("Error occurred during delete deck request: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/card/:id', async (req, res) => {
    const id = decodeURIComponent(req.params.id);
    const side1 = req.body.side1;
    const side2 = req.body.side2;
    const pronunciation = req.body.pronunciation;
    console.log("request made it to .post: ", id, side1, side2, pronunciation);
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', true);
    var sql = null
    var param = null
    if (side1 && side2 && pronunciation) {
        console.log('Request received');
        sql = `UPDATE cards SET side1 = '${side1}', side2 = '${side2}', pronunciation = '${pronunciation}' WHERE id = ${id}`;
        params = [id, side1, side2, pronunciation];
    }
    else if (side1 && side2) {
        console.log('Request with no pronunciation received');
        sql = `UPDATE cards SET side1 = '${side1}', side2 = '${side2}' WHERE id = ${id}`;
        params = [side1, side2, id];
    }
    else {
        console.log("Missing side1 or side2 parameter.");
        res.sendStatus(500);
        return
    }
    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sql, params, (err, result, fields) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        res.send("success");
        console.log("success");
    } catch (error) {
        console.log("the error has been caught by card update: ", error);
    }
})

// Deletes a card in a deck
router.delete('/:title/card', async (req, res) => {
    const title = req.params.title;
    const side1 = req.query.side1;
    const side2 = req.query.side2;
    const pronunciation = req.query.pronunciation;

    try {
        res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.header('Access-Control-Allow-Credentials', true);

        let sql, params;

        // Construct the SQL query based on the provided parameters
        if (pronunciation) {
            sql = 'DELETE FROM cards WHERE side1 = ? AND side2 = ? AND pronunciation = ? AND deckId = (SELECT id FROM deck WHERE title = ?)';
            params = [side1, side2, pronunciation, title];
        } else {
            sql = 'DELETE FROM cards WHERE side1 = ? AND side2 = ? AND pronunciation IS NULL AND deckId = (SELECT id FROM deck WHERE title = ?)';
            params = [side1, side2, title];
        }

        db.query(sql, params, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            // Check if any rows were affected by the delete operation
            if (result.affectedRows > 0) {
                return res.json({ message: 'Card deleted successfully' });
            } else {
                return res.status(404).json({ message: 'Card not found or already deleted' });
            }
        });

    } catch (error) {
        console.log("Error occurred during delete card request: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
