const mysql = require('mysql');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

module.exports = db;