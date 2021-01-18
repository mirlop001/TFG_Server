const express = require("express");
const app = express();

app.use(require("./user"));

app.use(require("./login"));
app.use(require("./signup"));

app.use(require("./food"));
app.use(require("./diary"));

module.exports = app;
