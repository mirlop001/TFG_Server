const express = require("express");
const customItemsController = require("../controllers/custom-items.controller");

const app = express();

app.get("/items/types", customItemsController.getCustomItemTypes);
app.get("/items", customItemsController.getCustomItems);
app.post("/items", customItemsController.buyItems);

module.exports = app;
