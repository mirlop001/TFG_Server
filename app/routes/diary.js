const express = require("express");
const diaryController = require("../controllers/diary.controller");

const app = express();

//GET
app.get("/insulin", diaryController.getInsulinTypes);

//POSTS
app.post("/diary/meals", diaryController.getMealsByDate);
app.post("/diary/insulin", diaryController.getInsulinDiaryByDate);

app.post("/glucose-diary", diaryController.saveGlucose);
app.post("/insulin-diary", diaryController.saveInsulin);

module.exports = app;
