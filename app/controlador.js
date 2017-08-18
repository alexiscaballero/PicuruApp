var app = require('../server');
var seq = app.get('models').sequelize;
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var mustache = require('mustache');
var fs = require('fs');
var logic = app.get('logic');
// http://docs.sequelizejs.com/en/v3/docs/querying/


/******************* Models ****************/
// var Colectivo = app.get('models').colectivo;
// var Empresa = app.get('models').empresa;
// var Funciones = app.get('models').funciones;
// var Permisos = app.get('models').permisos;
// var Persona = app.get('models').persona;
// var Recorrido = app.get('models').recorrido;
// var Rol = app.get('models').rol;
// var Segmento = app.get('models').segmento;
// var Sucursal = app.get('models').sucursal;
// var Track = app.get('models').track;
// var Turno = app.get('models').turno;
// var Ubicacion = app.get('models').ubicacion;
// var Usuario = app.get('models').usuario;




//Autenticacion
exports.authenticate = function (req, res) {
  //console.log(req.body);
  // find the user
  seq.query('SELECT * FROM matafuegos."USUARIO" WHERE "USR_NOMBRE" = :usuario ',
    { replacements: { usuario: req.body.usuario }, type: seq.QueryTypes.SELECT })
    .then(
      function(resUsuarios) {
        var usuario = resUsuarios[0];
        if (!usuario) {
          var mensaje = {message: " Usuario no encontrado."};
          loginError(req, res, mensaje);
        } else if (usuario) {
          var pass = req.body.clave;
          //encriptar pass y comparar con la de la db
          var hash = crypto.createHmac('sha512', app.get('superSecret'));
          hash.update(pass);
          var value = hash.digest('hex');
          // check if password matches
          if (String(usuario.USR_CLAVE).trim() != value) {
            var mensaje = {message: " Contraseña incorrecta."};
            loginError(req, res, mensaje);
          } else {
            // if user is found and password is right
            // create a token
            var token = jwt.sign(usuario, app.get('superSecret'), {
              expiresIn: 24*3600 // expires in 24 hours
            });
            req.session.token = token;
            req.session.usuario_id = usuario.USR_ID;
            res.redirect('/');
            //inicio(req, res);
          }
        }
      }
  );
}

exports.login = function (req, res) {
  fs.readFile('./ark/login/login.html', "utf8", function (err, html) {
    if (err) {
        throw err;
    }       
    var page = mustache.render(html,'{}');  
    res.send(page);
  });
}

function loginError(req, res, message) {
  fs.readFile('./ark/login/login.html', "utf8", function (err, html) {
    if (err) {
        throw err;
    }       
    var page = mustache.render(html,message);  
    res.send(page);
  });
}

function inicio(req, res) {
  //console.log(req.session.usuario_id);
  var usr = req.session.usuario_id;
  seq.query('WITH FUNCIONES AS ( SELECT f.* FROM matafuegos."FUNCION" f ) SELECT f3."FUN_ID",f3."FUN_TITULO",f3."FUN_DESCRIPCION",f3."FUN_ICONO",f3."FUN_PADRE_ID",f3."FUN_RUTA",f3."FUN_ES_PADRE", (CASE COUNT(FUNCIONES.*) WHEN 0 THEN NULL ELSE array_to_json(array_agg(row_to_json(FUNCIONES.*))) END) items FROM matafuegos."FUNCION" f3 JOIN matafuegos."FUNCION_ROL" fr ON f3."FUN_ID" = fr."FUNROL_FUN_ID" JOIN matafuegos."ROL" rl ON fr."FUNROL_ROL_ID" = rl."ROL_ID" JOIN matafuegos."USUARIO" us ON rl."ROL_ID" = us."USR_ROL_ID" LEFT JOIN FUNCIONES ON FUNCIONES."FUN_PADRE_ID" = f3."FUN_ID" WHERE us."USR_ID" = :usr_id AND f3."FUN_ES_PADRE" = TRUE GROUP BY f3."FUN_ID",f3."FUN_TITULO",f3."FUN_DESCRIPCION",f3."FUN_ICONO",f3."FUN_PADRE_ID",f3."FUN_RUTA",f3."FUN_ES_PADRE" ORDER BY f3."FUN_ORDEN" ASC',
    { replacements: { usr_id: req.session.usuario_id }, type: seq.QueryTypes.SELECT })
    .then(
      function(data_funciones) {
        var dataFun = {funciones: data_funciones};
        fs.readFile('./ark/main/index.html', "utf8", function (err, html) {
          if (err) {
              throw err;
          }       
          var page = mustache.render(html,dataFun);  
          res.send(page);
        });
      });
}

exports.inicio = function (req, res) {
  inicio(req, res);
}

function loadFunciones(usuarioId) {
  seq.query('WITH FUNCIONES AS ( SELECT f.* FROM matafuegos."FUNCION" f ) SELECT f3."FUN_ID",f3."FUN_TITULO",f3."FUN_DESCRIPCION",f3."FUN_ICONO",f3."FUN_PADRE_ID",f3."FUN_RUTA",f3."FUN_ES_PADRE", (CASE COUNT(FUNCIONES.*) WHEN 0 THEN NULL ELSE array_to_json(array_agg(row_to_json(FUNCIONES.*))) END) items FROM matafuegos."FUNCION" f3 JOIN matafuegos."FUNCION_ROL" fr ON f3."FUN_ID" = fr."FUNROL_FUN_ID" JOIN matafuegos."ROL" rl ON fr."FUNROL_ROL_ID" = rl."ROL_ID" JOIN matafuegos."USUARIO" us ON rl."ROL_ID" = us."USR_ROL_ID" LEFT JOIN FUNCIONES ON FUNCIONES."FUN_PADRE_ID" = f3."FUN_ID" WHERE us."USR_ID" = :usr_id AND f3."FUN_ES_PADRE" = TRUE GROUP BY f3."FUN_ID",f3."FUN_TITULO",f3."FUN_DESCRIPCION",f3."FUN_ICONO",f3."FUN_PADRE_ID",f3."FUN_RUTA",f3."FUN_ES_PADRE" ORDER BY f3."FUN_ORDEN" ASC',
    { replacements: { usr_id: usuarioId }, type: seq.QueryTypes.SELECT })
    .then(function(funciones) {return funciones});
}

exports.cerrarSesion = function (req, res) {
  req.session.token = null;
  req.session.usuario_id = null;
  res.redirect('/');
}

//cfgFunctions.funciones = function(req, res) {
//  return('esto se va a descontrolaaaa');
//}

exports.loadCfg = function (req, res, next) {
  var usr = req.session.usuario_id;
  seq.query('WITH FUNCIONES AS ( SELECT f.* FROM matafuegos."FUNCION" f ) SELECT f3."FUN_ID",f3."FUN_TITULO",f3."FUN_DESCRIPCION",f3."FUN_ICONO",f3."FUN_PADRE_ID",f3."FUN_RUTA",f3."FUN_ES_PADRE", (CASE COUNT(FUNCIONES.*) WHEN 0 THEN NULL ELSE array_to_json(array_agg(row_to_json(FUNCIONES.*))) END) items FROM matafuegos."FUNCION" f3 JOIN matafuegos."FUNCION_ROL" fr ON f3."FUN_ID" = fr."FUNROL_FUN_ID" JOIN matafuegos."ROL" rl ON fr."FUNROL_ROL_ID" = rl."ROL_ID" JOIN matafuegos."USUARIO" us ON rl."ROL_ID" = us."USR_ROL_ID" LEFT JOIN FUNCIONES ON FUNCIONES."FUN_PADRE_ID" = f3."FUN_ID" WHERE us."USR_ID" = :usr_id AND f3."FUN_ES_PADRE" = TRUE GROUP BY f3."FUN_ID",f3."FUN_TITULO",f3."FUN_DESCRIPCION",f3."FUN_ICONO",f3."FUN_PADRE_ID",f3."FUN_RUTA",f3."FUN_ES_PADRE" ORDER BY f3."FUN_ORDEN" ASC',
    { replacements: { usr_id: req.session.usuario_id }, type: seq.QueryTypes.SELECT })
    .then(
      function(data_funciones) {
        var dataFun = {funciones: data_funciones};
        //Cargar inicio del template
        fs.readFile('./ark/main/general.html', "utf8", function (err, html) {
          if (err) {
            throw err;
          }
          var ruta = req.url
          var n = ruta.indexOf("?");
          if (n !== -1) {
            ruta = ruta.substring(0, n);
          }
          //Cargar datos de la función
          seq.query('SELECT * FROM matafuegos."FUNCION" WHERE TRIM(UPPER("FUN_RUTA")) = TRIM(UPPER(:usr_ruta))',
            {replacements: { usr_ruta: ruta }, type: seq.QueryTypes.SELECT })
            .then(
              function(funciones) {
                //Cargar pantalla solicitada
                var funcionAcargar = req.url.split('/')[3]; //mejorar para que no se cague si le paso parametros por get
                var n = funcionAcargar.indexOf("?");
                if (n !== -1) {
                  funcionAcargar = funcionAcargar.substring(0, n);
                }
                logic[funcionAcargar](req, res, html, data_funciones, funciones[0], next);
              }
            ).catch(next); 
        });
    }).catch(next);
}



exports.ajaxFuncionesPadre = function (req, res) {
  seq.query('SELECT * FROM matafuegos."FUNCION" WHERE "FUN_ES_PADRE" = TRUE ORDER BY "FUN_TITULO" ASC',
    { replacements: {}, type: seq.QueryTypes.SELECT })
    .then(function(funciones) { res.send(funciones)});
}


exports.validarFormEditFuncion = function (req, res) {
  console.log(req.body.FUN_ID);
  var errors = [];
  //chequear que la descripcion y titulo no esten vacias
  if (req.body.FUN_ORDEN.trim() == "") {
    errors.push({campo:"FUN_ORDEN",msj:"El orden de la función no puede estar vacío."});
  }
  //chequear que la descripcion y titulo no esten vacias
  if (req.body.FUN_DESCRIPCION.trim() == "") {
    errors.push({campo:"FUN_DESCRIPCION",msj:"La descripción de la función no puede estar vacía."});
  }
  if (req.body.FUN_TITULO.trim() == "") {
    errors.push({campo:"FUN_TITULO",msj:"El título de la función no puede estar vacío."});
  }
  //chequear que tenga un icono cargado
  if (req.body.FUN_ICONO.trim() == "") {
    errors.push({campo:"FUN_ICONO",msj:"El ícono de la función no puede estar vacío."});
  }
  //chequear que si es padre, no tenga cargada una ruta
  if (req.body.FUN_RUTA.trim() != "" && req.body.FUN_ES_PADRE) {
    errors.push({campo:"FUN_RUTA",msj:"La ruta debe estar vacía si la función es padre."});
  }
  if (req.body.FUN_RUTA.trim() == "" && !req.body.FUN_ES_PADRE) {
    errors.push({campo:"FUN_RUTA",msj:"La ruta no puede estar vacía si la función no es padre."});
  }
  //chequear que la ruta no este ocupada ya por otra funcion
  seq.query('SELECT COUNT(*) FROM matafuegos."FUNCION" WHERE TRIM(UPPER("FUN_RUTA")) = TRIM(UPPER(:pFUN_RUTA)) AND "FUN_ID" <> :pFUN_ID',
    { replacements: {pFUN_ID: req.body.FUN_ID, pFUN_RUTA: req.body.FUN_RUTA.trim()}, type: seq.QueryTypes.SELECT })
    .then(function(cant) {
      var resultado = parseInt(cant[0]);
      if (resultado > 0) {
        errors.push({campo:"FUN_RUTA",msj:"La ruta ingresada ya está siendo utilizada por otra función."});     
      }
      console.log(errors);
      res.send(errors);
    }
  );
}

// //Prueba
// exports.getHola = function (req, res) {
//   //console.log("llamada al metodo hola");
//   res.write('HOLA MUNDO!');
//   res.end();
// }

// /**************  CRUD entity Ciudades ********/
// exports.getCiudades = function (req, res){
//     Ciudades.findAll({}).then(function(todasCiudades) {
//    	  res.json(todasCiudades);
// 	});
// }


// exports.setCiudad = function (req, res){
// 	Ciudades.findAll({}).then(function() {
//     	res.json(todasLasSecciones);
// 	});
// }



// exports.getTurnoActivo = function(req, res) {
//   var time = new Date();
//   var formattedHour = ("0" + time.getHours()).slice(-2)   + ":" + 
//                       ("0" + time.getMinutes()).slice(-2) + ":" + 
//                       ("0" + time.getSeconds()).slice(-2);
//   seq.query('SELECT * FROM turnos WHERE "horaInicio" <= time :horap AND "horaFin" >= time :horap AND recorrido_fk = :recorridop',
//     { replacements: { horap: formattedHour, recorridop: req.body.recorrido }, type: seq.QueryTypes.SELECT })
//   .then(function(turnos) {
//     res.json({
//               success: true,
//               turno: turnos[0]
//             });
//   });
// }

// exports.getRecorridos = function (req, res){
//   Recorrido.findAll({}).then(function(todosLosRecorridos) {
//       res.json({
//         success: true,
//         recorridos: todosLosRecorridos
//       });
//   });
// }

// exports.getRecorridoTurnoActivo = function(req, res) {
//   var time = new Date();
//   var formattedHour = ("0" + time.getHours()).slice(-2)   + ":" + 
//                       ("0" + time.getMinutes()).slice(-2) + ":" + 
//                       ("0" + time.getSeconds()).slice(-2);
//   seq.query('SELECT segmento."idSegmento", "ubicacionInicio_fk" AS idUbicacion, latitud, longitud, parada FROM turnos, segmento, ubicacion WHERE "horaInicio" <= time :horap AND "horaFin" >= time :horap AND turnos.recorrido_fk = :recorridop AND turnos.recorrido_fk = segmento.recorrido_fk AND "ubicacionInicio_fk" = "idUbicacion" UNION SELECT segmento."idSegmento", ubicacionFin_fk AS idUbicacion, latitud, longitud, parada FROM turnos, segmento, ubicacion WHERE "horaInicio" <= time :horap AND "horaFin" >= time :horap AND turnos.recorrido_fk = :recorridop AND turnos.recorrido_fk = segmento.recorrido_fk AND ubicacionFin_fk = "idUbicacion"',
//     { replacements: { horap: formattedHour, recorridop: req.body.recorrido }, type: seq.QueryTypes.SELECT })
//   .then(function(segmentos) {
//     res.json({
//               success: true,
//               segmentos: segmentos
//             });
//   });
// }

// exports.getTrackColectivo = function(req, res) {
//   seq.query('SELECT "idColectivo", patente, marca, "idTrack", fecha, hora, latitud, longitud, velocidad FROM turnos, colectivos, track WHERE turnos."idTurno" = track.turno_fk AND turnos.colectivo_fk = colectivos."idColectivo" AND turnos.recorrido_fk = :recorridop ORDER BY fecha DESC, hora DESC LIMIT 1',
//     { replacements: { recorridop: req.body.recorrido }, type: seq.QueryTypes.SELECT })
//     .then(function(lastTrack) {
//       console.log(lastTrack);
//       res.json({
//         success: true,
//         track: lastTrack[0]
//       });
//     });
// }

// exports.getEmpty = function(req, res) {
//   res.json({
//     success: true
//   });
// }

// exports.getColectivos = function(req, res) {
//   seq.query('SELECT "idColectivo", patente, modelo, marca, sucursal_fk as idSucursal FROM colectivos',
//     { replacements: { }, type: seq.QueryTypes.SELECT })
//     .then(function(listaColectivos) {
//       res.json({
//         success: true,
//         colectivos: listaColectivos
//       });
//     });
// }

// exports.getSucursales = function(req, res) {
//   seq.query('SELECT "idSucursal", direccion, descripcion, ciudad_fk as idCiudad, empresa_fk as idEmpresa FROM sucursal',
//     { replacements: { }, type: seq.QueryTypes.SELECT })
//     .then(function(listaSucursales) {
//       res.json({
//         success: true,
//         sucursales: listaSucursales
//       });
//     });
// }

// exports.saveColectivo = function(req, res) {
//   Colectivo.create({
//         patente: req.body.patente,
//         modelo: req.body.modelo,
//         marca: req.body.marca,
//         sucursal_fk: req.body.idSucursal
//       }).then(function(comentario) {
//         res.json({
//           success: true
//         });
//       });
// }

// exports.updateColectivo = function(req, res){
//   Colectivo.find({
//       where: {
//         idColectivo: req.body.idColectivo
//       }
//     }).then(function(colectivo) {
//         if (colectivo) {
//           colectivo.updateAttributes({
//             patente: req.body.patente,
//             modelo: req.body.modelo,
//             marca: req.body.marca,
//             sucursal_fk: req.body.idSucursal
//           }).then(function(colectivo) {
//             res.json({
//               success: true
//             });   
//           });
//         } else {
//           res.json({
//             success: false
//           });
//         };
//     });
// }

// exports.getChoferes = function(req, res) {
//   seq.query('SELECT * FROM  usuarios, personas, rol WHERE  usuarios."idRol" = rol."idRol" AND  usuarios."idPersona" = personas."idPersona" AND  rol.descripcion = \'CHOFER\'',
//     { replacements: { }, type: seq.QueryTypes.SELECT })
//     .then(function(listaChoferes) {
//       res.json({
//         success: true,
//         choferes: listaChoferes
//       });
//     });
// }

// exports.saveChofer = function(req, res) {
//   Persona.create({
//         dni: req.body.dni,
//         nombre: req.body.nombre
//       }).then(function(persona) {
//         Usuario.create({
//           usuario: req.body.usuario,
//           clave: 123,
//           idPersona: persona.idPersona,
//           idRol: 2
//         }).then(function(usuario) {
//           res.json({
//               success: true
//           });
//         });  
//       });
// }

// exports.updatePersona = function(req, res){
//   Persona.find({
//       where: {
//         idPersona: req.body.idPersona
//       }
//     }).then(function(persona) {
//         if (persona) {
//           persona.updateAttributes({
//             dni: req.body.dni,
//             nombre: req.body.nombre
//           }).then(function(persona) {
//             res.json({
//               success: true
//             });   
//           });
//         } else {
//           res.json({
//             success: false
//           });
//         };
//     });
// }

// exports.getTurnos = function(req, res) {
//   seq.query('SELECT "idTurno", "horaInicio", "horaFin", colectivo_fk "idColectivo", modelo, patente, recorrido_fk "idRecorrido", usuario_fk "idUsuario", nombre chofer, ramal FROM turnos, usuarios, personas, colectivos, recorridos WHERE turnos.usuario_fk = usuarios.id and personas."idPersona" = usuarios."idPersona" and turnos.colectivo_fk = colectivos."idColectivo" and turnos.recorrido_fk = recorridos."idRecorrido"',
//     { replacements: { }, type: seq.QueryTypes.SELECT })
//     .then(function(listaTurnos) {
//       res.json({
//         success: true,
//         turnos: listaTurnos
//       });
//     });
// }

// exports.saveTurno = function(req, res) {
//   seq.query('INSERT INTO "turnos" ("horaInicio","horaFin","colectivo_fk","recorrido_fk","usuario_fk") VALUES (time :horaInicio, time :horaFin, :pColectivo, :pRecorrido, :pUsuario)',
//     { replacements: { horaInicio: req.body.horaInicio, horaFin: req.body.horaFin, pColectivo: req.body.idColectivo, pRecorrido: req.body.idRecorrido, pUsuario: req.body.idUsuario}, type: seq.QueryTypes.SELECT })
//     .then(function(turno) {
//         res.json({
//               success: true
//           });  
//       });
// }

// exports.updateTurno = function(req, res) {
//   console.log('GUARDANDO TURNO!..');
//   seq.query('UPDATE turnos SET "horaInicio"= time :horaInicio, "horaFin"= time :horaFin, colectivo_fk= :pColectivo, recorrido_fk= :pRecorrido, usuario_fk= :pUsuario WHERE "idTurno" = :pIdTurno',
//     { replacements: { horaInicio: req.body.horaInicio, horaFin: req.body.horaFin, pColectivo: req.body.idColectivo, pRecorrido: req.body.idRecorrido, pUsuario: req.body.idUsuario, pIdTurno: req.body.idTurno}, type: seq.QueryTypes.SELECT })
//     .then(function(turno) {
//         res.json({
//               success: true
//           });  
//       });
// }