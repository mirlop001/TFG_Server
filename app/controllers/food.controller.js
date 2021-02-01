const mongoose = require("mongoose");
const moment = require("moment");

const FavouriteFood = require("../models/Food/favourite-food");
const FoodModel = require("../models/Food/food");
const FoodCategoryModel = require("../models/Food/food-category");

//Get food list
exports.getFoodList = (req, res) => {
	var user = mongoose.Types.ObjectId(req.headers.user);

	FoodCategoryModel.find()
		.sort("name")
		.populate({
			path: "foodList",
			options: {
				sort: "name",
			},
		})
		.then((data) => {
			FavouriteFood.findOne({ user: user })
				.select("food")
				.then((result) => {
					if (result) {
						var favList = result.food;

						data.forEach((foodCat) => {
							foodCat.foodList = foodCat.foodList.map(
								(foodItem) => {
									var id = foodItem._id;
									var isFav =
										favList.find((favId) => {
											return favId.equals(id);
										}) != null;

									return new FoodModel({
										_id: foodItem._id,
										name: foodItem.name,
										imageSrc: foodItem.imageSrc,
										gramsPerCarbRatio:
											foodItem.gramsPerCarbRatio,
										isFavourite: isFav,
									});
								}
							);
						});
					}

					res.send(data);
				});
		})
		.catch((err) => {
			res.status(500).send({
				message:
					err.message ||
					"An error occured while retrieving food types.",
			});
		});
};

exports.getFavourites = (req, res) => {
	let userId = req.headers.user;

	FavouriteFood.findOne({
		user: mongoose.Types.ObjectId(userId),
	})
		.populate("food")
		.then((favList) => {
			res.send(favList ? favList.food : null);
		})
		.catch((err) => {
			res.status(500).send({
				ok: false,
				message:
					"Se ha producido un error al obtener la lista de alimentos favoritos.",
			});
		});
};

exports.saveFavourites = (req, res) => {
	let user = mongoose.Types.ObjectId(req.headers.user);
	let foodList = req.body.foodList;

	FavouriteFood.findOne({ user: user })
		.then((data) => {
			if (data) {
				data.food = foodList;
				data.save();
			} else {
				var newFavourite = new FavouriteFood({
					user: user,
					food: foodList,
				});

				newFavourite.save();
			}

			res.send(true);
		})
		.catch((err) => {
			res.status(500).send({
				message:
					err.message ||
					"An error occured while retrieving food types.",
			});
		});
};
