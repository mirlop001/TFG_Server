var mongoose = require("mongoose");
const tableName = "action_response";

var schema = new mongoose.Schema(
	{
		name: { type: String },
		type: { type: Number },
		prize: { type: Number },
		title: { type: String },
		message: { type: String },
		problem: { type: String },
		solution: { type: String },
		examples: { type: [String] },
		status: { type: String },
		isAction: { type: Boolean },
	},
	{ timestamps: true }
);

module.exports = mongoose.model(tableName, schema, tableName);
