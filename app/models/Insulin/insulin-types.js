var mongoose = require("mongoose");
const tableName = "insulin_types";

var schema = new mongoose.Schema(
	{
		name: { type: String }
	},
	{ timestamps: true }
);

module.exports = mongoose.model(tableName, schema, tableName);
