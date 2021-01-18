var mongoose = require('mongoose');
const tableName = 'favourite_food';

var schema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    food: [{ type: mongoose.Types.ObjectId, ref: 'food' }],
});

module.exports = mongoose.model(tableName, schema, tableName);