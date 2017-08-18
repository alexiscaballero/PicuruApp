var Sequelize = require('sequelize');

// Inicializa datos para la conexion
/*
var sequelize = new Sequelize('postgres://postgres:samuchis@localhost:5432/geobus');
*/

var sequelize = new Sequelize('postgres', 'postgres', 'postgres',
{
    logging: true,
  	host: 'localhost',
    port: 5432,
  	dialect: 'postgres',
  	omitNull: true,
    define: {
      timestamps: false
    }
});

// Modelo de negocio
var models = [
  'funcion',
  'ciudad',
  'colectivo',
  'empresa',
  'funciones',
  'permisos',
  'persona',
  'recorrido',
  'rol',
  'segmento',
  'sucursal',
  'track',
  'turno',
  'ubicacion',
  'usuario'
];

models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

// describe relationships
/*
(function(m) {
  //m.comentario.belongsTo(m.entrada);
  //m.entrada.belongsTo(m.seccion);
  //m.seccion.hasMany(m.entrada);
  //m.entrada.hasMany(m.comentario);
})(module.exports);
*/
// export connection
module.exports.sequelize = sequelize;
