process.env.URLDB = `${APPSETTING_URLDB}`;
process.env.CADUCIDAD_TOKEN = `${APP_SETTING_CADUCIDAD_TOKEN}`;
process.env.SEED_AUTENTICACION = `${APPSETTING_SEED_AUTH}`;

module.exports = {
	url: process.env.URLDB,
};
