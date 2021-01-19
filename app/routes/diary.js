const express = require("express");
const diaryController = require("../controllers/diary.controller");

const app = express();

//GET
app.get("/insulin/types", diaryController.getInsulinTypes);

//POSTS
app.post("/meal-diary", diaryController.getMealsByDate);
app.post("/insulin-diary", diaryController.getInsulinDiaryByDate);
app.post("/glucose-diary", diaryController.getGlucoseDiaryByDate);

app.post("/meal", diaryController.saveMeal);
app.post("/glucose", diaryController.saveGlucose);
app.post("/insulin", diaryController.saveInsulin);

module.exports = app;
