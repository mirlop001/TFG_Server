process.env.PORT = process.env.PORT || 8080;

process.env.NODE_ENV = process.env.NODE_ENV || "dev";

let urlDB = "";
if (process.env.NODE_ENV === "dev") {
	urlDB = "mongodb://localhost:27017/sokery_db";
} else {
	urlDB =
		"mongodb+srv://mirlop01:Mufasa12.@mirlop01tfg.ku8e6.mongodb.net/mirlop01tfg_db?retryWrites=true&w=majority";
}

process.env.URLDB = urlDB;
process.env.CADUCIDAD_TOKEN = "48h";
process.env.SEED_AUTENTICACION =
	process.env.SEED_AUTENTICACION || "este-es-el-seed-desarrollo";

module.exports = {
	url: urlDB,
};
