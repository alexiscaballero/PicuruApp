var app = require('../../server');
var mustache = require('mustache');
var fs = require('fs');
var seq = app.get('models').sequelize;
var Funciones = app.get('models').funcion;
var colors = require('colors');

module.exports = function (req, res, htmlPrincipal, funcionesMenu, estaFuncion, next) {
  	var funId = req.query.FUN_ID;
  	var ope = req.query.OPERACION;
  	console.log(colors.green(req.query.FUN_ES_PADRE));
  	if (ope && ope == 'EDITAR') {
  		var esPadre = false;
  		if (req.query.FUN_ES_PADRE) {
  			esPadre = true;
  		}
  		var padreId;
  		if (req.query.FUN_PADRE_ID == -1) {
  			padreId = null;
  		} else {
  			padreId = req.query.FUN_PADRE_ID;
  		}
  		//Hacer update en la base
  		seq.query('UPDATE matafuegos."FUNCION" SET "FUN_TITULO" = :pFUN_TITULO, "FUN_DESCRIPCION" = :pFUN_DESCRIPCION, "FUN_RUTA" = :pFUN_RUTA, "FUN_ICONO" = :pFUN_ICONO, "FUN_ES_PADRE" = :pFUN_ES_PADRE, "FUN_PADRE_ID" = :pFUN_PADRE_ID, "FUN_ORDEN" = :pFUN_ORDEN WHERE "FUN_ID" = :pFUN_ID',
	    {	replacements: {
	    		pFUN_ID: funId,
	    		pFUN_TITULO: req.query.FUN_TITULO.trim(),
	    		pFUN_DESCRIPCION: req.query.FUN_DESCRIPCION.trim(),
	    		pFUN_RUTA: req.query.FUN_RUTA.trim(),
	    		pFUN_ICONO: req.query.FUN_ICONO.trim(),
	    		pFUN_ES_PADRE: esPadre,
	    		pFUN_PADRE_ID: padreId,
	    		pFUN_ORDEN: parseInt(req.query.FUN_ORDEN)
	    	},
	    	type: seq.QueryTypes.SELECT })
	    .then(
	    	function() {
	    		res.redirect('/api/logic/funciones?successEdit=1');
	    	}
	    ).catch(next);
  	} else if (ope && ope == 'AGREGAR' && funId == -1) {
  		var esPadre = false;
  		if (req.query.FUN_ES_PADRE) {
  			esPadre = true;
  		}
  		var padreId;
  		if (req.query.FUN_PADRE_ID == -1) {
  			padreId = null;
  		} else {
  			padreId = req.query.FUN_PADRE_ID;
  		}
  		//Hacer insert en la base
  		seq.query('INSERT INTO matafuegos."FUNCION" ("FUN_TITULO","FUN_DESCRIPCION","FUN_RUTA","FUN_ICONO","FUN_ES_PADRE","FUN_PADRE_ID","FUN_ORDEN") VALUES(:pFUN_TITULO,:pFUN_DESCRIPCION,:pFUN_RUTA,:pFUN_ICONO,:pFUN_ES_PADRE,:pFUN_PADRE_ID,:pFUN_ORDEN)',
	    {	replacements: {
	    		pFUN_ID: funId,
	    		pFUN_TITULO: req.query.FUN_TITULO.trim(),
	    		pFUN_DESCRIPCION: req.query.FUN_DESCRIPCION.trim(),
	    		pFUN_RUTA: req.query.FUN_RUTA.trim(),
	    		pFUN_ICONO: req.query.FUN_ICONO.trim(),
	    		pFUN_ES_PADRE: esPadre,
	    		pFUN_PADRE_ID: padreId,
	    		pFUN_ORDEN: parseInt(req.query.FUN_ORDEN)
	    	},
	    	type: seq.QueryTypes.SELECT })
	    .then(
	    	function() {
	    		res.redirect('/api/logic/funciones?successEdit=1');
	    	}
	    ).catch(next);
  	} else if (ope && ope == 'AGREGAR') {
    	fs.readFile('./ark/funciones/add.html', "utf8", function (err, html) {
          	if (err) {
              	throw err;
          	}
          	//Renderizamos el contenido de la pagina en particular
          	var pagina = mustache.render(html,'{}');
          	var contenido = {funciones: funcionesMenu, funcion: estaFuncion, content: pagina}
          	//Renderizamos el template, junto con el contenido ya renderizado
          	var finalPage = mustache.render(htmlPrincipal,contenido);
          	res.send(finalPage);
    	});
  	} else if (funId && !ope) {
  		seq.query('SELECT * FROM matafuegos."FUNCION" WHERE "FUN_ID" = :funId',
	    {replacements: {funId: funId}, type: seq.QueryTypes.SELECT })
	    .then(
	    	function(data_funcion) {
	        	var dataFun = {fun: data_funcion[0]}
	        	fs.readFile('./ark/funciones/edit.html', "utf8", function (err, html) {
		          	if (err) {
		              	throw err;
		          	}
		          	//Renderizamos el contenido de la pagina en particular
		          	var pagina = mustache.render(html,dataFun);
		          	var contenido = {funciones: funcionesMenu, funcion: estaFuncion, content: pagina}
		          	//Renderizamos el template, junto con el contenido ya renderizado
		          	var finalPage = mustache.render(htmlPrincipal,contenido);
		          	res.send(finalPage);
	        	});
	      	}
	    ).catch(next);
  	} else {
	  	seq.query('SELECT * FROM matafuegos."FUNCION" ORDER BY "FUN_TITULO" ASC',
	    {replacements: {}, type: seq.QueryTypes.SELECT })
	    .then(
	    	function(data_funciones) {
	        	var dataFun = {funciones: data_funciones, msj: req.query.successEdit}
	        	fs.readFile('./ark/funciones/index.html', "utf8", function (err, html) {
		          	if (err) {
		              	throw err;
		          	}
		          	//Renderizamos el contenido de la pagina en particular
		          	var pagina = mustache.render(html,dataFun);
		          	var contenido = {funciones: funcionesMenu, funcion: estaFuncion, content: pagina}
		          	//Renderizamos el template, junto con el contenido ya renderizado
		          	var finalPage = mustache.render(htmlPrincipal,contenido);
		          	res.send(finalPage);
	        	});
	      	}
	    ).catch(next);
	}
} 