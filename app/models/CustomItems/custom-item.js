var mongoose = require("mongoose");
const tableName = "custom_items";

var schema = new mongoose.Schema({
	name: { type: String, required: true },
	price: { type: Number, default: 0 },
	acquired: { type: Boolean },
	inUse: { type: Boolean },
	type: { type: mongoose.Types.ObjectId, ref: "custom_item_types" },
	imageSrc: { type: String, required: true },
	value: { type: String },
	order: { type: Number },
});

module.exports = mongoose.model(tableName, schema, tableName);
