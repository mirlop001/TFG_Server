var mongoose = require("mongoose");

var uniqueValidator = require("mongoose-unique-validator");

let availableRoles = {
	values: ["ADMIN", "USER"],
	message: "{VALUE} no es un role válido",
};

const tableName = "users";

var schema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},

		email: {
			type: String,
			required: true,
			unique: true,
		},

		password: {
			type: String,
		},

		role: {
			type: String,
			default: "USER",
			required: [true],
			enum: availableRoles,
		},

		coins: {
			type: Number,
			default: 0,
		},

		currentAction: {
			type: mongoose.Types.ObjectId,
			ref: "required_actions",
		},

		customItems: [
			{
				type: mongoose.Types.ObjectId,
				ref: "user_custom_items",
			},
		],
	},
	{ timestamps: true }
);

schema.methods.toJSON = function () {
	let user = this;
	let userObject = user.toObject();
	delete userObject.password;
	return userObject;
};

schema.plugin(uniqueValidator, {
	message: "{PATH} debe de ser único",
});

module.exports = mongoose.model(tableName, schema);
