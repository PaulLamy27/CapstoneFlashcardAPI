// vercel
const db = require('./db_config');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
// const path = require('path');

// const _dirname = path.resolve(__dirname, '../../CapstoneFlashcardApplication');
// const buildPath = path.join(_dirname, 'CapstoneFlashcardApplication', 'dist');

const app = express();
app.use(express());
app.use(express.json()); // Add this line to enable JSON parsin
// app.use(express.static(buildPath));

// app.get("/*", function (req, res) {
//     res.sendFile(
//         path.join(buildPath, 'index.html'),
//         function (err) {
//             if (err) {
//                 console.log("in the res.sendFile for index.html, the following error is: ", err);
//                 res.status(500).send(err);
//             }
//         }
//     );
// });

dotenv.config();

const DeckRoutes = require('./api/deck');
const RegistrationRoutes = require('./api/registration');

// This line is for parsing incoming JSON requests
// app.use(express.json());

app.use(cors({
    origin: true,
    methods: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// app.use(cors());
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
//     next();
// });
app.use(cookieParser());

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

app.use('/api/deck', DeckRoutes);
app.use('/api/registration', RegistrationRoutes);

// Enable CORS for the /login route
app.options('/login', cors()); // Handle preflight request
app.post('/login', cors(), async (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    const sql = 'SELECT * FROM user WHERE username = ?';
    db.query(sql, [req.body.username], (err, data) => {
        if (err) return res.json({ Error: "Login error in server" });
        if (data.length > 0) {
            const name = data[0].id;
            const name1 = data[0].username;
            console.log("name: ", name);
            console.log("name1: ", name1);
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
                if (err) {
                    console.log("Logging in did not work; error: ", err);
                    res.status(500);
                } else {
                    // If login is successful, get the user's account ID
                    console.log("so far so good");

                    // create a JWT as a string that contains the user id and username
                    // secret is the secret key that only the server knows 
                    const token = jwt.sign({ id: name, username: name1 }, "jwt-secret-key", { expiresIn: "1d" });

                    // set an HTTP respponse header to create a new cookie in client's browser
                    // user_token is the actualy token, httpOnly is a security measure
                    res.setHeader('Set-Cookie', `user_token=${token}; HttpOnly;`);

                    // send response
                    res.json({ name, token });
                }
            })
            // bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
            //     console.log("Hashed Password from Database:", data[0].password);
            //     console.log("Password Sent during Login:", req.body.password.toString());
            //     if (err) return res.json({ Error: "Password compare error" });
            //     if (response) {
            //         const name = data[0].id;
            //         const name1 = data[0].username;
            //         console.log("User id:", name);
            //         console.log("Username:", name1);
            //         const token = jwt.sign({ id: name, username: name1 }, "jwt-secret-key", { expiresIn: "1d" });
            //         res.cookie('token', token, {
            //             secure: true,
            //             httpOnly: true,
            //             sameSite: 'none'
            //         });
            //         return res.json({ Status: "Success", username: name1 });
            //     }
            //     else {
            //         return res.json({ Error: "Password not matched" });
            //     }
            // })
        }
        else {
            return res.json({ Error: "No username existed" });
        }
    })
})

const verifyUser = (req, res, next) => {
    console.log("begin verifyUser");
    const user_token = req.cookies.user_token;
    if (!user_token) {
        console.log("You are not authenticated");
        return res.json({ Error: "You are not authenticated" });
    }
    else {
        console.log("user_token exists.");
        jwt.verify(user_token, "jwt-secret-key", (err, decoded) => {
            if (err) {
                console.log("Token is not correct");
                return res.json({ Error: "Token is not correct" });
            }
            else {
                console.log("Token was decded.");
                req.id = decoded.id;
                console.log("req.id: ", req.id);
                req.username = decoded.username
                console.log("req.username: ", req.username);
                next();
            }
        })
    }
}

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", id: req.id, username: req.username })
})

app.get('/test', cors(), (req, res) => {
    res.status(200).json('Welcome, api is up on vercel');
});

app.get('/logout', (req, res) => {
    try {
        res.clearCookie('user_token');
        return res.json({ Status: "Success" });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ Error: "Internal Server Error" });
    }
})

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

module.exports = app;
