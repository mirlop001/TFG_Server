const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const UserModel = require("../models/User/user");
const RequiredActions = require("../models/User/required-actions");

exports.saveCoins = function (req, res) {
	let user = req.headers.user;
	let coins = req.body.coins;

	UserModel.findById(user, (err, result) => {
		if (result) {
			result.coins = result.coins += coins;
			result.save();
			res.send(result);
		} else {
			res.status(500).send({
				ok: false,
				message: "No se ha encontrado el usuario",
			});
		}
	});
};

exports.getUserInformation = (req, res) => {
	let user = mongoose.Types.ObjectId(req.headers.user);

	UserModel.findOne({ _id: user })
		.populate({
			path: "currentAction",
			match: { fulfilled: false },
			options: {
				path: "type",
			},
		})
		.then((result) => {
			if (result) {
				res.send(result);
			} else {
				res.status(500).send({
					ok: false,
					message: "No se ha encontrado el usuario",
				});
			}
		});
};

exports.setRequiredAction = (req, res) => {
	let user = req.headers.user;
	let { id, message, avatarStatus, time } = req.body;

	RequiredActions.findOne(
		{
			user: user,
			message: message,
			fulfilled: false,
		},
		(err, response) => {
			if (!response) {
				let pendingTasks = new RequiredActions({
					id: id,
					message: message,
					avatarStatus: avatarStatus,
					time: time,
					user: mongoose.Types.ObjectId(user),
				});

				try {
					pendingTasks.save();
					res.send(pendingTasks);
				} catch (e) {
					res.status(500).send({ ok: false, message: e });
				}
			} else {
				response.fulfilled = true;
				response.save();
				res.send(response);
			}
		}
	);
};
