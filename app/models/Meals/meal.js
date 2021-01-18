var mongoose = require("mongoose");
const tableName = "meals";

var schema = new mongoose.Schema(
	{
		foodItem: { type: mongoose.Types.ObjectId, ref: "food" },
		grams: { type: Number, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model(tableName, schema, tableName);
