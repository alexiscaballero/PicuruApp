module.exports = function(sequelize, DataTypes) {
  return sequelize.define("track", {
    idTrack: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    fecha: DataTypes.DATE,
    latitud: DataTypes.REAL,
    longitud: DataTypes.REAL,
    /* Cambiar por la clase Turno */
    turno: DataTypes.INTEGER
  })
}
