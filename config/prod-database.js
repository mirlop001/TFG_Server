process.env.PORT = process.env.PORT || 8080;
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

let urlDB = "";
let seed = "";
let token = "";

if (process.env.NODE_ENV === "dev") {
	urlDB = "mongodb://localhost:27017/sokery_db";
	seed = "este-es-el-seed-desarrollo";
	token = "48h";
} else {
	urlDB = `${APPSETTING_URLDB}`;
	seed = `${APPSETTING_SEED_AUTH}`;
	token = `${APPSETTING_CADUCIDAD_TOKEN}`;
}

process.env.URLDB = urlDB;
process.env.CADUCIDAD_TOKEN = token;
process.env.SEED_AUTENTICACION = seed;

module.exports = {
	url: process.env.URLDB,
};
