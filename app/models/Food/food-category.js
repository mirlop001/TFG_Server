var mongoose = require('mongoose');
const tableName = 'food_categories';

var schema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    foodList: [{ type: mongoose.Types.ObjectId, ref: 'food' }]

}, { timestamps: true });

module.exports = mongoose.model(tableName, schema, tableName);