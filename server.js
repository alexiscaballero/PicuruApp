// Inicialización
var express  = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');
var app = module.exports = express();
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('./app/config');
var mustache = require('mustache');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session')

var port = 8888;

app.set('models', require('./app/models'));
app.set('logic', require('./app/logic'));

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  // configure stuff here
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['megustaelarte'],
  // Cookie Options
  //maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: false,
  httpOnly: true
}));
app.use(express.static(__dirname + '/ark/shared/'));
//app.use('/fonts', express.static('ark/shared/misc/'));
app.use('/fonts', express.static('./node_modules/font-awesome/fonts'));
app.use(morgan('dev')); // activamos el log en modo 'dev'
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(methodOverride('_method'));


require('./app/rutasPublicas.js')(app);

app.use('', router);

// app.use(function(err,req,res,next) {
//   console.log(err.stack);
//   res.status(500).send({"Error" : err.stack});
// });

app.set('superSecret', config.secret);

}


//Filtro para proteger las llamadas a la API que necesitan autenticacion
router.use(function timeLog(req, res, next) {
 	// check header or url parameters or post parameters for token
 	var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token || req.session.token;
 	// decode token
 	if (token) {
	   	// verifies secret and checks exp
	   	jwt.verify(token, app.get('superSecret'), function(err, decoded) {
	     	if (err) {
	       		console.log("Token Invalido.");
	       		fs.readFile('./ark/login/login.html', "utf8", function (err, html) {
		    		if (err) {
		        		throw err;
		    		}
		    		var page = mustache.render(html,'{}');  
		    		res.send(page);
		  		});
	    	} else {
	       		// if everything is good, save to request for use in other routes
	       		console.log("Token Valido.");
	       		req.decoded = decoded;
	       		next();
	     	}
	   	});
 	} else {
   		// if there is no token
   		// return an error
	   	// return res.status(403).send({
	   	// 	success: false,
	   	// 	message: 'No se envio ningun token.'
	   	// });
	   	fs.readFile('./ark/login/login.html', "utf8", function (err, html) {
		    if (err) {
		    	throw err;
		    }
		    var page = mustache.render(html,'{}');  
		    res.send(page);
		});
 	}
});


// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: err
//     });
// });

// Cargamos los endpoints
require('./app/rutas.js')(app);



app.use(function(req, res, next){
    res.status(404);
    var seq = app.get('models').sequelize;
    var usr = req.session.usuario_id;
  	seq.query('WITH FUNCIONES AS ( SELECT f.* FROM matafuegos."FUNCION" f ) SELECT f3."FUN_ID",f3."FUN_TITULO",f3."FUN_DESCRIPCION",f3."FUN_ICONO",f3."FUN_PADRE_ID",f3."FUN_RUTA",f3."FUN_ES_PADRE", (CASE COUNT(FUNCIONES.*) WHEN 0 THEN NULL ELSE array_to_json(array_agg(row_to_json(FUNCIONES.*))) END) items FROM matafuegos."FUNCION" f3 JOIN matafuegos."FUNCION_ROL" fr ON f3."FUN_ID" = fr."FUNROL_FUN_ID" JOIN matafuegos."ROL" rl ON fr."FUNROL_ROL_ID" = rl."ROL_ID" JOIN matafuegos."USUARIO" us ON rl."ROL_ID" = us."USR_ROL_ID" LEFT JOIN FUNCIONES ON FUNCIONES."FUN_PADRE_ID" = f3."FUN_ID" WHERE us."USR_ID" = :usr_id AND f3."FUN_ES_PADRE" = TRUE GROUP BY f3."FUN_ID",f3."FUN_TITULO",f3."FUN_DESCRIPCION",f3."FUN_ICONO",f3."FUN_PADRE_ID",f3."FUN_RUTA",f3."FUN_ES_PADRE" ORDER BY f3."FUN_ORDEN" ASC',
    { replacements: { usr_id: req.session.usuario_id }, type: seq.QueryTypes.SELECT })
    .then(
      function(data_funciones) {
        var dataFun = {funciones: data_funciones};
        fs.readFile('./ark/main/404.html', "utf8", function (err, html) {
          if (err) {
              throw err;
          }       
          var page = mustache.render(html,dataFun);  
          res.send(page);
        });
      });
});


// function clientErrorHandler (err, req, res, next) {
//    if (req.xhr) {
//       res.status(500).send({ error: 'Something failed!' })
//     } else {
//       next(err)
//    }
// }

// app.use(clientErrorHandler);

// Cogemos el puerto para escuchar
app.listen(port);
console.log("Servidor Cerruti Corriendo En El Puerto " + port);

