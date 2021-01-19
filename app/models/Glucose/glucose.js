var mongoose = require("mongoose");

const tableName = "glucose";

var schema = new mongoose.Schema(
	{
		glucose: { type: Number, required: true },
		comments: { type: String, required: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model(tableName, schema, tableName);
