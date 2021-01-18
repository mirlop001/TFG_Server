const mongoose = require("mongoose");
const moment = require("moment");

const FavouriteFood = require("../models/Food/favourite-food");
const FoodModel = require("../models/Food/food");
const FoodCategoryModel = require("../models/Food/food-category");
const MealModel = require("../models/Meals/meal");
const MealDiaryModel = require("../models/Meals/meal-diary");

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
										description: foodItem.description,
										gramsPerCarbRatio:
											foodItem.gramsPerCarbRatio,
										picture: foodItem.picture,
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
			res.send(favList.food);
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

exports.saveMeal = (req, res) => {
	let user = req.headers.user;
	let { meals, mealType } = req.body;
	let newMealList = [];
	let date = new Date();

	meals.forEach((meal) => {
		if (meal.grams) {
			let mealItem = new MealModel({
				foodItem: meal.foodItem?._id,
				grams: meal.grams,
				user: user,
			});

			mealItem.save();
			newMealList.push(mealItem);
		}
	});

	MealDiaryModel.findOneAndUpdate(
		{
			user: mongoose.Types.ObjectId(user),

			createdAt: {
				$gte: moment(date).startOf("day"),
				$lt: moment(date).endOf("day"),
			},

			mealType: mealType,
		},
		{
			mealList: newMealList,
		},
		{
			new: true,
			upsert: true,
			rawResult: true,
		}
	)
		.then((result) => {
			console.log(result.lastErrorObject.updatedExisting);
			res.send(result);
		})
		.catch((err) => {
			res.status(500).send({
				message: `Se ha producido un error al guardar el diario: ${err}`,
			});
		});
};
