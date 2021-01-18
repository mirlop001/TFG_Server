const express = require("express");
const app = express();
const { mongoose } = require("mongoose");
const foodController = require("../controllers/food.controller");

const FoodCategoryModel = require("../models/Food/food-category");
const FoodModel = require("../models/Food/food");

app.get("/food", foodController.getFoodList);
app.get("/food/favourites", foodController.getFavourites);

app.post("/food/meal", foodController.saveMeal);
app.post("/food/favourites", foodController.saveFavourites);

module.exports = app;
