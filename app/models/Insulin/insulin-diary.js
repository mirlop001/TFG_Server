var mongoose = require("mongoose");
const tableName = "insulin_diaries";

var schema = new mongoose.Schema(
	{
		type: { type: mongoose.Types.ObjectId, ref: "insulin_types" },
		user: { type: mongoose.Types.ObjectId, ref: "users" },
		quantity: { type: Number, require: true }
	},
	{ timestamps: true }
);

module.exports = mongoose.model(tableName, schema, tableName);
