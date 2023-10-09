const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;
const secretKey = 'MySuperSecretKey';

const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

// Mock user data (remember, don't store plain-text passwords even in mocks)
let users = [
    {
        id: 1,
        username: 'Praharsha',
        password: '123' // This should be hashed
    },
    {
        id: 2,
        username: 'Srikar',
        password: '456' // This should be hashed
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: 180 });
        console.log(`User ${username} authenticated successfully.`);
        return res.json({
            success: true,
            err: null,
            token
        });
    }

    console.error(`Authentication failed for user ${username}.`);
    res.status(401).json({
        success: false,
        token: null,
        err: 'Username or password is incorrect'
    });
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    console.log("Accessed dashboard.");
    res.json({
        success: true,
        myContent: 'Secret content that only logged-in people can see'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    console.log("Accessed settings.");
    res.json({
        success: true,
        myContent: 'Settings content that is protected by JWT'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        console.error("Unauthorized access attempt detected.");
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Unauthorized. Please log in.'
        });
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
