var Controller = require ('./controlador');
var mustache = require('mustache');
var fs = require('fs');

module.exports = function(app) {

  app.get('/', Controller.inicio);
  app.get('/api/logout', Controller.cerrarSesion);
  app.get('/api/logic/*', Controller.loadCfg);
  app.get('/api/ajax/funcionesPadre', Controller.ajaxFuncionesPadre)
  app.post('/api/ajax/validarFormEditFuncion', Controller.validarFormEditFuncion)
  
  var seq = app.get('models').sequelize;
  app.use(function(err, req, res, next) {
    // catch errors
    var usr = req.session.usuario_id;
    seq.query('WITH FUNCIONES AS ( SELECT f.* FROM matafuegos."FUNCION" f ) SELECT f3."FUN_ID",f3."FUN_TITULO",f3."FUN_DESCRIPCION",f3."FUN_ICONO",f3."FUN_PADRE_ID",f3."FUN_RUTA",f3."FUN_ES_PADRE", (CASE COUNT(FUNCIONES.*) WHEN 0 THEN NULL ELSE array_to_json(array_agg(row_to_json(FUNCIONES.*))) END) items FROM matafuegos."FUNCION" f3 JOIN matafuegos."FUNCION_ROL" fr ON f3."FUN_ID" = fr."FUNROL_FUN_ID" JOIN matafuegos."ROL" rl ON fr."FUNROL_ROL_ID" = rl."ROL_ID" JOIN matafuegos."USUARIO" us ON rl."ROL_ID" = us."USR_ROL_ID" LEFT JOIN FUNCIONES ON FUNCIONES."FUN_PADRE_ID" = f3."FUN_ID" WHERE us."USR_ID" = :usr_id AND f3."FUN_ES_PADRE" = TRUE GROUP BY f3."FUN_ID",f3."FUN_TITULO",f3."FUN_DESCRIPCION",f3."FUN_ICONO",f3."FUN_PADRE_ID",f3."FUN_RUTA",f3."FUN_ES_PADRE" ORDER BY f3."FUN_ORDEN" ASC',
    { replacements: { usr_id: req.session.usuario_id }, type: seq.QueryTypes.SELECT })
    .then(
      function(data_funciones) {
        var dataFun = {funciones: data_funciones, error: err};
        fs.readFile('./ark/main/500.html', "utf8", function (err, html) {
          if (err) {
              throw err;
          }       
          var page = mustache.render(html,dataFun);  
          res.send(page);
        });
      });
  });

};
