var mongoose = require("mongoose");
const tableName = "food";

var schema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true },
		gramsPerCarbRatio: { type: Number, required: true },
		imageSrc: { type: String },
	},
	{ timestamps: true, strict: false }
);

module.exports = mongoose.model(tableName, schema, tableName);
