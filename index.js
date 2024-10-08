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
const LoginRoutes = require('./api/login');
const UserRoutes = require('./api/user');

// This line is for parsing incoming JSON requests
// app.use(express.json());

// List of valid origins
const validOrigins = [
    'http://localhost:5173',
    'https://capstone-flashcard-application.vercel.app/',
    'https://capstone-flashcard-application-6aq1euwz6-paullamy27s-projects.vercel.app/',
];

app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
app.use('/api/login', LoginRoutes);
app.use('/api/user', UserRoutes);
// Enable CORS for the /login route
// app.options('/login', cors()); // Handle preflight request
// app.post('/login', cors(), async (req, res) => {
//     res.header('Access-Control-Allow-Origin', req.headers.origin);
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     res.header('Access-Control-Allow-Credentials', true);
//     const sql = 'SELECT * FROM user WHERE username = ?';
//     db.query(sql, [req.body.username], (err, data) => {
//         if (err) return res.json({ Error: "Login error in server" });
//         if (data.length > 0) {
//             const name = data[0].id;
//             const name1 = data[0].username;
//             console.log("name: ", name);
//             console.log("name1: ", name1);
//             bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
//                 if (err) {
//                     console.log("Logging in did not work; error: ", err);
//                     res.status(500);
//                 } else {
//                     // If login is successful, get the user's account ID
//                     console.log("so far so good");

//                     // create a JWT as a string that contains the user id and username
//                     // secret is the secret key that only the server knows 
//                     const token = jwt.sign({ id: name, username: name1 }, "jwt-secret-key", { expiresIn: "1d" });

//                     // set an HTTP respponse header to create a new cookie in client's browser
//                     // user_token is the actualy token, httpOnly is a security measure
// //                    res.setHeader('Set-Cookie', `token=${token}; HttpOnly;`);

//                     res.cookie('token', token, {
//                         httpOnly: true,
//                         sameSite: 'lax',
//                         secure
//                     });

//                     // send response
//                     res.json({ name, token });
//                 }
//             })
//         }
//         else {
//             return res.json({ Error: "No username existed" });
//         }
//     })
// })

app.post('/login', cors(), async (req, res) => {
    // allow the origin of the request
    const saltRounds = 10;
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    // https://capstone-flashcard-application-6aq1euwz6-paullamy27s-projects.vercel.app/
    // res.header('Access-Control-Allow-Origin', 'https://capstone-flashcard-application-6aq1euwz6-paullamy27s-projects.vercel.app/');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    const sql = 'SELECT * FROM user WHERE username = ?';
    db.query(sql, [req.body.username], async (err, data) => {
        if (err) return res.json({ Error: "Login error in server" });
        if (data.length > 0) {
            // if (req.body.password === data[0].password) {
            //     // const name = data[0].id;
            //     // const name1 = data[0].username;`
            //     // console.log(name1);
            //     // const token = jwt.sign({ id: name }, "jwt-secret-key", { expiresIn: "1d" });
            //     // res.cookie('token', token, {
            //     //     secure: true,
            //     //     httpOnly: true,
            //     //     sameSite: 'lax'
            //     // });
            //     // return res.json({ Status: "Success", username: name1 });
            //     // create a JWT as a string that contains the user id and username
            //     // secret is the secret key that only the server knows 
            //     const token = jwt.sign({ id: data[0].id, username: data[0].username }, 'secret');

            //     // set an HTTP respponse header to create a new cookie in client's browser
            //     // user_token is the actualy token, httpOnly is a security measure
            //     // res.setHeader('Set-Cookie', `user_token=${token}; HttpOnly;`);
            //     res.cookie('token', token, {
            //         secure: true,
            //         httpOnly: true,
            //         sameSite: 'lax'
            //     });

            //     // send response
            //     res.json({ Status: "Success", user, token });
            // }
            // else {
            //     return res.json({ Error: "Password not matched" });
            // }
            // console.log("req.body.password: ", req.body.password);

            // first param is plaintext (will be hashed by bcrypt),
            // second param is the hash.
            bcrypt.compare(req.body.password, data[0].password, (err, response) => {
                console.log("Hashed Password from Database:", data[0].password);
                console.log("Password Sent during Login:", req.body.password.toString());
                if (err) return res.json({ Error: "Password compare error" });
                if (response) {
                    console.log("data[0]: ", data[0]);
                    const userId = data[0].id;
                    const username = data[0].username;
                    const password = data[0].password;
                    console.log("User id:", userId);
                    console.log("Username:", username);
                    console.log("password:", password);
                    const token = jwt.sign({ id: userId, username: username }, "jwt-secret-key", { expiresIn: "1d" });
                    res.cookie('token', token, {
                        secure: true,
                        httpOnly: true,
                        sameSite: 'lax'
                    });
                    console.log("token (on backend): ", token);
                    return res.json({ Status: "Success", token: token, username: username });
                }
                else {
                    return res.json({ Error: "Password not matched" });
                }
            })
        }
        else {
            return res.json({ Error: "No email existed" });
        }
    })
})

// const verifyUser = (req, res, next) => {
//     console.log("begin verifyUser");
//     const token = req.cookies.token;
//     console.log("token: ", token);
//     if (!token) {
//         console.log("You are not authenticated");
//         return res.json({ Error: "You are not authenticated" });
//     }
//     else {
//         console.log("user_token exists.");
//         jwt.verify(token, "jwt-secret-key", (err, decoded) => {
//             if (err) {
//                 console.log("Token is not correct");
//                 return res.json({ Error: "Token is not correct" });
//             }
//             else {
//                 console.log("Token was decded.");
//                 req.id = decoded.id;
//                 console.log("req.id: ", req.id);
//                 req.username = decoded.username
//                 console.log("req.username: ", req.username);
//                 next();
//             }
//         })
//     }
// }

// app.get('/', verifyUser, (req, res) => {
//     return res.json({ Status: "Success", id: req.id, username: req.username })
// })

app.get('/test', cors(), (req, res) => {
    res.status(200).json('Welcome, api is up on vercel');
});

// app.get('/logout', (req, res) => { 
app.post('/logout', (req, res) => {
    console.log("thanks for using CardMentor! logging out...");
    try {
        console.log("req.session: ", req);
        // res.clearCookie('user_token');
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
