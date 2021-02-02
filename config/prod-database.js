process.env.NODE_ENV = process.env.NODE_ENV || "dev";

let urlDB = "";
if (process.env.NODE_ENV === "dev") {
	urlDB = "mongodb://localhost:27017/sokery_db";
} else {
	urlDB = `${APPSETTING_URLDB}`;
}

process.env.URLDB = urlDB;

module.exports = {
	url: process.env.URLDB,
};
