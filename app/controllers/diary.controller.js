const moment = require("moment");
const mongoose = require("mongoose");

const MealDiaryModel = require("../models/Meals/meal-diary");

const GlucoseDiaryModel = require("../models/Glucose/glucose-diary");
const GlucoseModel = require("../models/Glucose/glucose");

const InsulinDiaryModel = require("../models/Insulin/insulin-diary");
const InsulinTypeModel = require("../models/Insulin/insulin-types");

const RequiredActionModel = require("../models/User/required-actions");
const ActionResponseModel = require("../models/User/action-response");

exports.getMealsByDate = function (req, res) {
	var user = req.headers.user;
	var { date } = req.body;

	MealDiaryModel.find({
		user: mongoose.Types.ObjectId(user),

		date: {
			$gte: moment(date).startOf("day"),
			$lt: moment(date).endOf("day"),
		},
	})
		.populate({
			path: "mealList",
			populate: {
				path: "foodType",
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

exports.saveGlucose = (req, res) => {
	let user = req.headers.user;
	let { glucose, comments } = req.body;
	let date = new Date();

	var newModel = new GlucoseModel({
		value: glucose,
		comments: comments,
	});

	newModel.save();

	let val = GlucoseDiaryModel.findOneAndUpdate(
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
			if (!result.lastErrorObject.updatedExisting) {
				this.manageRequiredActions(1, user, false, res);
			}

			// if (result.length == 0) {
			// 	if (glucose >= 65 && glucose <= 75) {
			// 		ActionModel.findOne({ type: 1 }, (actionErr, actionRes) => {
			// 			if (actionErr) {
			// 				actionRes.status(500).send(actionErr);
			// 			}

			// 			if (actionRes) {
			// 				glucoseResult.message = actionRes;

			// 				var newAction = new RequiredActionModel({
			// 					type: actionRes._id,
			// 					user: user,
			// 					fulfilled: false,
			// 				});

			// 				newAction.save();
			// 			}
			// 			res.send(glucoseResult);
			// 		});
			// 	} else {
			// 		glucoseResult.message = new ActionModel({
			// 			prize: 2,
			// 			title: "Glucosa en ayunas",
			// 		});
			// 	}
			// } else {
			// 	let hyperglycemiaFixed =
			// 		requiredAction && requiredAction.type == 6;

			// 	if (
			// 		hyperglycemiaFixed &&
			// 		moment(requiredAction.createdAt).diff(moment(), "minutes") <
			// 			15
			// 	) {
			// 		res.send({
			// 			message: {
			// 				title: "Glucemia muy pronto",
			// 				problem: `Hummm...ha pasado ${moment(
			// 					requiredAction.createdAt
			// 				).diff(
			// 					moment(),
			// 					"minutes"
			// 				)} min desde que aplicaste la última dosis de insulina...`,
			// 				solution:
			// 					"Sería recomendable esperar alrededor de unos 15 minutos",
			// 			},
			// 		});
			// 	} else {
			// 		if (glucose < 65) {
			// 			if (hyperglycemiaFixed) {
			// 				ActionModel.findOne(
			// 					{ type: 7 },
			// 					(actionErr, actionRes) => {
			// 						if (actionErr) {
			// 							actionRes.status(500).send(actionErr);
			// 						}

			// 						if (actionRes) {
			// 							glucoseResult.message = actionRes;

			// 							var newAction = new RequiredActionModel(
			// 								{
			// 									type: actionRes._id,
			// 									user: user,
			// 									fulfilled: true,
			// 								}
			// 							);

			// 							newAction.save();
			// 						}
			// 						res.send(glucoseResult);
			// 					}
			// 				);
			// 			} else {
			// 				ActionModel.findOne(
			// 					{ type: 2 },
			// 					(actionErr, actionRes) => {
			// 						if (actionErr) {
			// 							actionRes.status(500).send(actionErr);
			// 						}

			// 						if (actionRes) {
			// 							glucoseResult.message = actionRes;

			// 							var newAction = new RequiredActionModel(
			// 								{
			// 									type: actionRes._id,
			// 									user: user,
			// 									fulfilled: false,
			// 								}
			// 							);

			// 							newAction.save();
			// 						}
			// 						res.send(glucoseResult);
			// 					}
			// 				);
			// 			}
			// 		} else if (glucose >= 180) {
			// 			ActionModel.findOne(
			// 				{ type: 5 },
			// 				(actionErr, actionRes) => {
			// 					if (actionErr) {
			// 						actionRes.status(500).send(actionErr);
			// 					}

			// 					if (actionRes) {
			// 						actionRes.createdAt = moment();
			// 						glucoseResult.message = actionRes;

			// 						var newAction = new RequiredActionModel({
			// 							type: actionRes._id,
			// 							user: user,
			// 							fulfilled: false,
			// 						});

			// 						newAction.save();
			// 					}
			// 					res.send(glucoseResult);
			// 				}
			// 			);
			// 		} else {
			// 			if (requiredAction) {
			// 				if (requiredAction.type == 3) {
			// 					RequiredActionModel.findOneAndUpdate(
			// 						{
			// 							user: user,
			// 							fulfilled: false,
			// 							type: requiredAction._id,
			// 						},
			// 						{ fulfilled: true }
			// 					).then((reqActionRes) => {
			// 						ActionModel.find({ type: 4 }).then(
			// 							(action) => {
			// 								glucoseResult.message = action;
			// 								res.send(finalResponse);
			// 							}
			// 						);
			// 					});
			// 				}
			// 			} else {
			// 				glucoseResult.message = new ActionModel({
			// 					prize: 5,
			// 					title: "Registro de glucemia correcta",
			// 				});

			// 				res.send(glucoseResult);
			// 			}
			// 		}
			// 	}
			// }
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
	var user = req.headers.user;
	var { type, quantity, requiredAction } = req.body;

	var newEntry = new InsulinDiaryModel({
		type: type,
		user: user,
		quantity: quantity,
	});

	try {
		newEntry.save();

		if (requiredAction) {
			RequiredActionModel.findOneAndUpdate(
				{ user: user, fulfilled: false, type: requiredAction._id },
				{ fulfilled: true }
			).then((reqActionRes) => {
				if (reqActionRes) {
					ActionModel.findOne({ type: 6 }).then((action) => {
						action.createdAt = moment();
						let newAction = new RequiredActionModel({
							fulfilled: false,
							type: action._id,
							user: user,
						});
						newAction.save();

						res.send({ message: action });
					});
				} else res.send(newEntry);
			});
		}
	} catch (err) {
		res.status(500).send(err);
	}
};

/**************** PRIVATE FUNCTIONS ****************/
exports.manageRequiredActions = (nextActionType, user, fulfilled, res) => {
	ActionResponseModel.findOne({ type: nextActionType }).then((actionRes) => {
		var newAction = new RequiredActionModel({
			type: actionRes._id,
			user: user,
			fulfilled: fulfilled,
			status: actionRes.status,
		});

		newAction.save();
		res.send(actionRes);
	});
};
