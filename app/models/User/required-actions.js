var mongoose = require("mongoose");
const tableName = "required_actions";

var schema = new mongoose.Schema(
	{
		type: { type: mongoose.Types.ObjectId, ref: "actiontypes" },
		user: { type: mongoose.Types.ObjectId, ref: "users" },
		fulfilled: { type: Boolean, default: 0 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model(tableName, schema);
