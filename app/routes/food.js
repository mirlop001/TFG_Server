const express = require("express");
const app = express();
const foodController = require("../controllers/food.controller");

app.get("/food", foodController.getFoodList);
app.get("/food/favourites", foodController.getFavourites);

app.post("/food/favourites", foodController.saveFavourites);

module.exports = app;
