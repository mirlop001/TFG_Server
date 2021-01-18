const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/User/user");

exports.login = (req, res) => {
	var { email, password } = req.body;

	UserModel.findOne({ email: email }, (erro, userData) => {
		if (erro) {
			return res.status(500).send({
				ok: false,
				message: erro,
			});
		}

		if (!userData) {
			return res.status(400).send({
				ok: false,
				message: "Usuario o contraseña incorrectos",
			});
		}

		// Valida que la contraseña escrita por el usuario, sea la almacenada en la db
		if (!bcrypt.compareSync(password, userData.password)) {
			return res.status(400).send({
				ok: false,
				message: "Usuario o contraseña incorrectos",
			});
		}

		// Genera el token de autenticación
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
			user: userData._id.toString(),
			token: token,
		};

		res.send(result);
	});
};
