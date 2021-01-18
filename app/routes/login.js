const express = require('express');
const loginController = require('../controllers/login.controller');

const app = express();

app.post('/login', loginController.login);

module.exports = app;