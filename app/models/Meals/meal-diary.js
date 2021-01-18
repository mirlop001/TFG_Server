var mongoose = require("mongoose");
const tableName = "meal_diaries";

var schema = new mongoose.Schema(
	{
		mealList: [{ type: mongoose.Types.ObjectId, ref: "meals" }],
		mealType: { type: String, required: true },
		user: { type: mongoose.Types.ObjectId, ref: "users" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model(tableName, schema, tableName);
