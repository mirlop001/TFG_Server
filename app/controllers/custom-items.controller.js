const CustomItemTypeModel = require("../models/CustomItems/custom-item-type");
const mongoose = require("mongoose");

const CustomItemModel = require("../models/CustomItems/custom-item");
const UserModel = require("../models/User/user");
const userCustomItem = require("../models/User/user-custom-item");

exports.getCustomItemTypes = (req, res) => {
	CustomItemTypeModel.find()
		.then((result) => {
			res.send(result);
		})
		.catch((err) => {
			res.status(500).send(
				"Error al obtener los tipos de obtetos: " + err
			);
		});
};

exports.getCustomItems = (req, res) => {
	let userId = mongoose.Types.ObjectId(req.headers.user);

	CustomItemModel.find()
		.populate("type")
		.then((result) => {
			UserModel.findOne({ _id: userId })
				.populate({
					path: "customItems",
				})
				.then((userData) => {
					if (userData) {
						let customItemsArray = Array.from(userData.customItems);

						result.forEach((item) => {
							let found = customItemsArray.find((userItem) => {
								return userItem.item.equals(item._id);
							});

							if (found) {
								item.inUse = found.inUse;
								item.acquired = true;
							}
						});

						res.send({
							customItems: result,
							currentCoins: userData.coins,
						});
					} else {
						res.status(500).send(
							"No se ha podido encontrar el usuario con id " +
								userId +
								":" +
								err
						);
					}
				})
				.catch((err) => {
					res.status(500).send(
						"No se ha podido encontrar el usuario con id " +
							userId +
							":" +
							err
					);
				});
		})
		.catch((err) => {
			res.status(500).send(
				"Error al obtener los tipos de obtetos: " + err
			);
		});
};

exports.buyItems = (req, res) => {
	let userId = mongoose.Types.ObjectId(req.headers.user);
	let { selectedItems, total } = req.body;

	let customItemChanges = selectedItems.map((customItem) => {
		let userItem = new userCustomItem({
			item: customItem._id,
			inUse: customItem.inUse,
		});

		userItem.save();

		return userItem;
	});

	UserModel.findOneAndUpdate(
		{ _id: userId },
		{ customItems: customItemChanges },
		{ new: true, upsert: true }
	)
		.then((user) => {
			user.coins -= total;
			user.save();
			res.send(customItemChanges);
		})
		.catch((err) => {
			res.status(500).send("Usuario no encontrado: " + err);
		});
};
