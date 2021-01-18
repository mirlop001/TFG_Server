const express = require('express');
const signupController = require('../controllers/signup.controller');

const app = express();

app.post('/signup', signupController.signUp);

module.exports = app;