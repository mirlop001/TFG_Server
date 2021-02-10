const moment = require("moment");
const mongoose = require("mongoose");

const MealDiaryModel = require("../models/Meals/meal-diary");
const MealModel = require("../models/Meals/meal");

const UserModel = require("../models/User/user");
const GlucoseModel = require("../models/Glucose/glucose");
const GlucoseDiaryModel = require("../models/Glucose/glucose-diary");

const InsulinDiaryModel = require("../models/Insulin/insulin-diary");
const InsulinTypeModel = require("../models/Insulin/insulin-types");

const RequiredActionModel = require("../models/User/required-actions");
const ActionResponseModel = require("../models/User/action-response");

const ACTION_TYPES = {
	HIPOGLUCEMIA: 1,
	INSULINA: 2,
	GLUCOSA_AYUNAS_BIEN: 3,
	HIPOGLUCEMIA_HC: 4,
	HIPOGLUCEMIA_CORREGIDA: 5,
	FALTA_GLUCOSA_AYUNAS: 6,
	HIPERGLUCEMIA: 7,
	HIPERGLUCEMIA_CORREGIDA: 8,
};

exports.getMealsByDate = function (req, res) {
	var user = req.headers.user;
	var { date } = req.body;

	MealDiaryModel.find({
		user: mongoose.Types.ObjectId(user),

		createdAt: {
			$gte: moment(date).startOf("day"),
			$lt: moment(date).endOf("day"),
		},
	})
		.populate({
			path: "mealList",
			populate: {
				path: "foodItem",
			},
		})
		.then((mealList) => {
			res.send(mealList);
		})
		.catch((err) => {
			res.status(500).send({
				ok: false,
				message:
					"No se ha podido obtener los datos del diario de comidas del día " +
					moment(date).format("DD-MM-YYYY"),
			});
		});
};

exports.getInsulinDiaryByDate = (req, res) => {
	var user = req.headers.user;
	var { date } = req.body;

	InsulinDiaryModel.find({
		user: mongoose.Types.ObjectId(user),

		createdAt: {
			$gte: moment(date).startOf("day"),
			$lt: moment(date).endOf("day"),
		},
	})
		.populate("type")
		.then((insulinList) => {
			res.send(insulinList);
		})
		.catch((err) => {
			res.status(500).send({
				ok: false,
				message:
					"No se ha podido obtener los datos del diario de insulina del día " +
					moment(date).format("DD-MM-YYYY"),
			});
		});
};

exports.getGlucoseDiaryByDate = (req, res) => {
	var user = req.headers.user;
	var { date } = req.body;

	GlucoseDiaryModel.findOne({
		user: mongoose.Types.ObjectId(user),

		createdAt: {
			$gte: moment(date).startOf("day"),
			$lt: moment(date).endOf("day"),
		},
	})
		.populate("glucoseList")
		.then((glucoseDiary) => {
			res.send(glucoseDiary ? glucoseDiary.glucoseList : null);
		})
		.catch((err) => {
			res.status(500).send({
				ok: false,
				message:
					"No se ha podido obtener los datos del diario de insulina del día " +
					moment(date).format("DD-MM-YYYY"),
			});
		});
};

exports.saveGlucose = (req, res) => {
	let user = req.headers.user;
	let { glucoseData, requiredAction } = req.body;
	let date = new Date();

	let glucose = glucoseData.glucose;
	let comments = glucoseData.comments;

	var newModel = new GlucoseModel({
		glucose: glucose,
		comments: comments,
	});

	GlucoseDiaryModel.findOneAndUpdate(
		{
			user: mongoose.Types.ObjectId(user),

			createdAt: {
				$gte: moment(date).startOf("day"),
				$lt: moment(date).endOf("day"),
			},
		},
		{
			$push: { glucoseList: newModel._id },
		},
		{
			new: true,
			upsert: true,
			rawResult: true,
		}
	)
		.then((result) => {
			manageFirstGlycemia(
				!result.lastErrorObject.updatedExisting,
				user,
				date,
				newModel,
				requiredAction,
				res
			);
		})
		.catch((err) => {
			res.status(500).send({
				ok: false,
				message: err,
			});
		});
};

exports.getInsulinTypes = (req, res) => {
	InsulinTypeModel.find({}, (insulinErr, insulinRes) => {
		if (insulinErr) res.status(500).send(insulinErr);

		res.send(insulinRes);
	});
};

exports.saveInsulin = (req, res) => {
	var user = mongoose.Types.ObjectId(req.headers.user);
	var { type, quantity, requiredAction } = req.body;

	var newEntry = new InsulinDiaryModel({
		type: type,
		user: user,
		quantity: quantity,
	});

	try {
		newEntry.save();
		res.send({ message: "Insulina guardada correctamente" });
	} catch (err) {
		res.status(500).send(err);
	}
};

exports.saveMeal = (req, res) => {
	let user = req.headers.user;
	let { meals, mealType, requiredAction } = req.body;
	let newMealList = [];
	let date = new Date();
	let totalCarbs = 0;

	meals.forEach((meal) => {
		let foodItem = meal.foodItem ? meal.foodItem._id : null;

		if (meal.grams) {
			let mealItem = new MealModel({
				foodItem: foodItem,
				grams: meal.grams,
				user: user,
			});

			totalCarbs += meal.grams;

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
			if (requiredAction) {
				getAndInsertRequiredAction(
					ACTION_TYPES.HIPOGLUCEMIA_HC,
					totalCarbs > 20 || totalCarbs < 13
						? "Humm...Has tomado más raciones de las recomendadas"
						: null,
					null,
					user,
					res,
					requiredAction
				);
			} else {
				res.send({ message: "¡Guardado correctamente!" });
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: `Se ha producido un error al guardar el diario: ${err}`,
			});
		});
};

/**************** PRIVATE FUNCTIONS ****************/
updateUserAction = (userId, prize, newAction, actionRes, res) => {
	UserModel.findOne({ _id: userId })
		.then((userResponse) => {
			userResponse.coins += prize ? prize : actionRes.prize;

			if (userResponse.currentAction !== newAction)
				userResponse.currentAction = newAction;

			userResponse.save();

			if (res) res.send(actionRes);
		})
		.catch((err) => {
			if (res)
				res.status(500).send("Error al actualizar el usuario: " + err);
		});
};

getAndSendActionMessage = (userId, type, prize, res) => {
	ActionResponseModel.findOne({ type: type })
		.then((actionMessage) => {
			if (actionMessage) {
				let newResponse = new ActionResponseModel(actionMessage);

				if (prize) newResponse.prize = prize;
				updateUserAction(userId, prize);

				res.send(newResponse);
			} else {
				res.send({
					message: "Guardado correctamente",
				});
			}
		})
		.catch((err) => {
			res.status(500).send(
				"Error al obtener la lista de mensajes de acción: " + err
			);
		});
};

getAndInsertRequiredAction = (
	type,
	prize,
	name,
	user,
	res,
	requiredAction,
	actionResponse
) => {
	let date = new Date();

	if (requiredAction) {
		ActionResponseModel.findOne({ type: type })
			.then((newActionResponse) => {
				//Si entra una nueva tarea (p.e: hiperglucemia tras hipoglucemia) se sobreescribe
				if (
					(newActionResponse.prevAction &&
						newActionResponse.prevAction == requiredAction.type) ||
					!newActionResponse.prevAction
				) {
					ActionResponseModel.findOne({ type: type })
						.then((currentActionResponse) => {
							RequiredActionModel.findOneAndUpdate(
								{
									user: user,
									createdAt: {
										$gte: moment(date).startOf("day"),
										$lt: moment(date).endOf("day"),
									},
									fulfilled: false,
									type: mongoose.Types.ObjectId(
										requiredAction._id
									),
								},
								{ fulfilled: true }
							)
								.then((oldRequiredActionUpdated) => {
									let newRequiredAction = new RequiredActionModel(
										{
											type: newActionResponse._id,
											fulfilled:
												newActionResponse.nextAction ==
												null,
											user: user,
										}
									);

									newRequiredAction.save();

									updateUserAction(
										user,
										null,
										newRequiredAction,
										newActionResponse,
										res
									);
								})
								.catch((err) => {
									res.status(500).send(
										"Error al actualizar una acción de usuario: " +
											err
									);
								});
						})
						.catch((err) => {
							res.status(500).send(err);
						});
				} else {
					res.send({ message: "Guardado con éxito" });
				}
			})
			.catch((err) => {
				res.status.send(
					"Error al obtener el mensaje de acción: " + err
				);
			});
	} else {
		ActionResponseModel.findOne({ type: type })
			.then((newRequiredActionMessage) => {
				let newRequiredAction = new RequiredActionModel({
					fulfilled: false,
					type: newRequiredActionMessage._id,
					status: newRequiredActionMessage.status,
					user: user,
				});

				newRequiredAction.save();

				if (prize) {
					newRequiredActionMessage.prize = prize;
					newRequiredActionMessage.name = name;
				}
				updateUserAction(
					user,
					null,
					newRequiredAction,
					newRequiredActionMessage,
					res
				);
			})
			.catch((err) => {
				res.status.send(
					"Error al obtener el mensaje de acción: " + err
				);
			});
	}
};

manageFirstGlycemia = (isFirst, user, date, newModel, requiredAction, res) => {
	if (isFirst) {
		//Comprobamos si existe algún registro de comidas
		MealDiaryModel.findOne({
			user: mongoose.Types.ObjectId(user),

			createdAt: {
				$gte: moment(date).startOf("day"),
				$lt: moment(date).endOf("day"),
			},
		})
			.then((existsFoodMeal) => {
				let responseNotSuccessfull = new ActionResponseModel({
					title:
						"No has realizado o registrado la glucemia en ayunas",
					status: "triste.gif",
					solution:
						"Es recomendable realizar una glucemia en ayunas antes del desayuno y de la correspondiente dosis de insulina.",
				});

				if (!existsFoodMeal) {
					//Si no existe registro de comidas, buscamos algún registro de insulina

					InsulinDiaryModel.findOne({
						user: mongoose.Types.ObjectId(user),

						createdAt: {
							$gte: moment(date).startOf("day"),
							$lt: moment(date).endOf("day"),
						},
					})
						.then((existsInsulinEntry) => {
							if (!existsInsulinEntry) {
								//Si no existe entonces es la primera glucemia del día, recompensamos:
								//Obtenemos el último premio glucemia en ayunas
								RequiredActionModel.findOne(
									{ user: mongoose.Types.ObjectId(user) },
									{},
									{ sort: { created_at: -1 } }
								)
									.then((lastEarnedPrize) => {
										let consecutiveDays = 0;
										let currentDate = moment().add(
											1,
											"day"
										);

										//Si hay premio ganado, y el día es posterior al actual entonces se multiplica el número de días consecutivos * 2
										if (
											lastEarnedPrize &&
											moment(lastEarnedPrize.createdAt)
												.startOf("day")
												.isSame(
													currentDate.startOf("day")
												)
										) {
											consecutiveDays =
												lastEarnedPrize / 2;
										}

										let prize = (consecutiveDays + 1) * 2;

										//Actualizamos el usuario con el nuevo número de monedas
										UserModel.findOne({ _id: user })
											.then((userResponse) => {
												userResponse.coins += prize;

												userResponse.save();
												newModel.save();

												if (newModel.glucose < 65) {
													//La glucosa está muy baja, controlamos hipoglucemia
													getAndInsertRequiredAction(
														ACTION_TYPES.HIPOGLUCEMIA,
														prize,
														"glucemia en ayunas",
														user,
														res,
														requiredAction
													);
												} else if (
													newModel.glucose > 180
												) {
												} else {
													//La glucosa está bien, obtenemos y mandamos mensaje de premio
													getAndSendActionMessage(
														user,
														ACTION_TYPES.GLUCOSA_AYUNAS_BIEN,
														prize,
														res
													);
												}
											})
											.catch((err) => {
												res.status(500).send(
													"Error al actualizar el usuario: " +
														err
												);
											});
									})
									.catch((err) => {
										res.status.send(
											"Error obteniendo el último premio por glucemia en ayunas."
										);
									});
							} else {
								newModel.save();

								//Se ha registrado una dosis de insulina antes que de ayunas, por lo que se notifica
								res.send(responseNotSuccessfull);
							}
						})
						.catch((err) => {
							res.status(500).send(
								"Error al controlar la primera glucemia del día" +
									err
							);
						});
				} else {
					newModel.save();
					// Se ha registrado la comida antes que la glucosa
					res.send(responseNotSuccessfull);
				}
			})
			.catch((err) => {
				res.status(500).send(
					"Error al controlar la primera glucemia del día" + err
				);
			});
	} else {
		if (newModel.glucose < 65) {
			//La glucosa está muy baja, controlamos hipoglucemia
			getAndInsertRequiredAction(
				ACTION_TYPES.HIPOGLUCEMIA,
				null,
				null,
				user,
				res,
				requiredAction
			);
		} else if (newModel.glucose > 180) {
			getAndInsertRequiredAction(
				ACTION_TYPES.HIPERGLUCEMIA,
				null,
				null,
				user,
				res,
				requiredAction
			);
		} else {
			if (requiredAction) {
				if (requiredAction.type == ACTION_TYPES.HIPOGLUCEMIA_HC) {
					getAndInsertRequiredAction(
						ACTION_TYPES.HIPOGLUCEMIA_CORREGIDA,
						null,
						null,
						user,
						res,
						requiredAction
					);
				} else {
					getAndInsertRequiredAction(
						ACTION_TYPES.HIPERGLUCEMIA_CORREGIDA,
						null,
						null,
						user,
						res,
						requiredAction
					);
				}
			} else {
				let successfullResponse = new ActionResponseModel({
					title: "¡Muy bien!",
					message: "¡Control de glucemia guardado!",
				});
				res.send(successfullResponse);
			}
		}
	}
};
