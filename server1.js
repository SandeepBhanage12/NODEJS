const mysql = require('mysql2');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3000;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sandeep'
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Database connected successfully');
    }
    let query = `CREATE DATABASE IF NOT EXISTS TRAVEL`;
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Database created");
        }
    });

    query = `USE TRAVEL`;
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Database TRAVEL used");
        }
    });

    query = `CREATE TABLE IF NOT EXISTS users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50),
        email VARCHAR(50) UNIQUE,
        phno VARCHAR(15)
    )`;
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Table created");
        }
    });
});

// Common style
const style = `
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 400px;
            text-align: center;
        }
        h2 {
            color: #333;
        }
        label {
            display: block;
            margin-bottom: 5px;
            color: #555;
        }
        input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            background-color: #45a049;
        }
        a {
            color: #4CAF50;
            text-decoration: none;
            display: block;
            margin-top: 10px;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
`;

// Routes
// Home Route
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            ${style}
        </head>
        <body>
            <div class="container">
                <h2>User Management</h2>
                <form method="POST" action="/user">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required>
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                    <label for="phno">Phone Number:</label>
                    <input type="text" id="phno" name="phno" required>
                    <button type="submit">Insert</button>
                </form>
                <button onclick="window.location.href='/update'">Update User</button>
                <button onclick="window.location.href='/delete'">Delete User</button>
            </div>
        </body>
        </html>
    `);
});

// Insert User
app.post('/user', (req, res) => {
    const { name, email, phno } = req.body;
    const query = `INSERT INTO users (name, email, phno) VALUES (?, ?, ?)`;
    db.query(query, [name, email, phno], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send(`
                <p>Error saving user. Please try again.</p>
                <a href="/">Go back</a>
            `);
        } else {
            res.status(200).send(`
                <p>User added successfully!</p>
                <a href="/">Add another user</a>
            `);
        }
    });
});

// Update User Page
app.get('/update', (req, res) => {
    res.send(`
        <html>
        <head>
            ${style}
        </head>
        <body>
            <div class="container">
                <h2>Update User</h2>
                <form method="POST" action="/user/update">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                    <label for="name">New Name:</label>
                    <input type="text" id="name" name="name">
                    <label for="phno">New Phone Number:</label>
                    <input type="text" id="phno" name="phno">
                    <button type="submit">Update</button>
                </form>
                <a href="/">Go back to Home</a>
            </div>
        </body>
        </html>
    `);
});

// Update User Operation
app.post('/user/update', (req, res) => {
    const { email, name, phno } = req.body;
    let query = `UPDATE users SET `;
    const updates = [];
    if (name) updates.push(`name = '${name}'`);
    if (phno) updates.push(`phno = '${phno}'`);
    query += updates.join(', ') + ` WHERE email = ?`;

    db.query(query, [email], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send(`
                <p>Error updating user. Please try again.</p>
                <a href="/">Go back</a>
            `);
        } else if (result.affectedRows === 0) {
            res.status(404).send(`
                <p>No user found with the given email.</p>
                <a href="/">Go back</a>
            `);
        } else {
            res.status(200).send(`
                <p>User updated successfully!</p>
                <a href="/update">Update another user</a>
            `);
        }
    });
});

// Delete User Page
app.get('/delete', (req, res) => {
    res.send(`
        <html>
        <head>
            ${style}
        </head>
        <body>
            <div class="container">
                <h2>Delete User</h2>
                <form method="POST" action="/user/delete">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                    <button type="submit">Delete</button>
                </form>
                <a href="/">Go back to Home</a>
            </div>
        </body>
        </html>
    `);
});

// Delete User Operation
app.post('/user/delete', (req, res) => {
    const { email } = req.body;
    const query = `DELETE FROM users WHERE email = ?`;
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send(`
                <p>Error deleting user. Please try again.</p>
                <a href="/">Go back</a>
            `);
        } else if (result.affectedRows === 0) {
            res.status(404).send(`
                <p>No user found with the given email.</p>
                <a href="/">Go back</a>
            `);
        } else {
            res.status(200).send(`
                <p>User deleted successfully!</p>
                <a href="/delete">Delete another user</a>
            `);
        }
    });
});

// Start server
app.listen(port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server running on http://localhost:${port}`);
    }
});
