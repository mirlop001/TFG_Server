var mongoose = require("mongoose");

const tableName = "glucose_diaries";

var schema = new mongoose.Schema(
	{
		glucoseList: [{ type: mongoose.Types.ObjectId, ref: "glucose" }],
		user: { type: mongoose.Types.ObjectId, ref: "users" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model(tableName, schema, tableName);
