var Controller = require ('./controlador');

module.exports = function(app) {

	//Pantalla de login
	//app.get('/', Controller.login);
	//Autenticacion
	app.post('/api/authenticate', Controller.authenticate);
};
