var mongoose = require("mongoose");
const tableName = "custom_item_types";

var schema = new mongoose.Schema({
	name: { type: String, required: true },
	order: { type: Number, default: 0 },
});

module.exports = mongoose.model(tableName, schema, tableName);
