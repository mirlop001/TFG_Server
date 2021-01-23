var mongoose = require("mongoose");
const tableName = "user_custom_items";

var schema = new mongoose.Schema(
	{
		user: { type: mongoose.Types.ObjectId, ref: "user" },
		item: { type: mongoose.Types.ObjectId, ref: "custom_items" },
		inUse: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model(tableName, schema);
