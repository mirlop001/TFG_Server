const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/User/user");

exports.signUp = function (req, res) {
	let body = req.body;
	let { name, email, password, role } = body;

	UserModel.find({ email: email })
		.then((userData) => {
			if (userData.length) {
				res.status(400).send({
					ok: false,
					message: "Ya existe un usuario con este email.",
				});
			} else {
				let user = new UserModel({
					name,
					email,
					password: bcrypt.hashSync(password, 10),
					role,
				});
				user.save((err, userData) => {
					if (err) {
						res.status(400).send({
							ok: false,
							message: err,
						});
					} else {
						let token = jwt.sign(
							{
								user: userData,
							},
							process.env.SEED_AUTENTICACION,
							{
								expiresIn: process.env.CADUCIDAD_TOKEN,
							}
						);

						let result = {
							user: userData._id,
							token: token,
						};

						res.send(result);
					}
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				ok: false,
				message: err,
			});
		});
};
