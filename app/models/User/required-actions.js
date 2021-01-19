var mongoose = require("mongoose");
const tableName = "required_actions";

var schema = new mongoose.Schema(
	{
		type: { type: mongoose.Types.ObjectId, ref: "action_response" },
		user: { type: mongoose.Types.ObjectId, ref: "users" },
		fulfilled: { type: Boolean, default: 0 },
		status: { type: String },
	},
	{ timestamps: true }
);

module.exports = mongoose.model(tableName, schema);
