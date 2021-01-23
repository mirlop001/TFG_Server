const express = require("express");
const userController = require("../controllers/user.controller.js");

const app = express();

app.post("/user/coins", userController.saveCoins);
app.get("/user", userController.getUserInformation);
app.post("/user/action", userController.setRequiredAction);
app.post("/user/items", userController.saveCustomItems);

module.exports = app;
