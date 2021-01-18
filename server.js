const express = require("express");
const app = express();
const mongoose = require("mongoose");
const database = require("./config/database");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { env } = require("process");

//******************** Configuration *********************//
mongoose.connect(database.url);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

//******************** Routes *********************//
app.use("/api/", require("./app/routes/index"));

//******************** Listen *********************//

app.use(express.static(__dirname + "/public/client"));
app.get("*", function (req, res) {
	res.sendFile(path.join(__dirname + "/public/client/index.html"));
});

app.listen(process.env.PORT, () => {
	console.log("Escuchando en puerto " + env.PORT);
});
