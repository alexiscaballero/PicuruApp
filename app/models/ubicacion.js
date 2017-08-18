module.exports = function(sequelize, DataTypes) {
  return sequelize.define("ubicacion", {
    idUbicacion: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    latitud: DataTypes.REAL,
    longitud: DataTypes.REAL,
    parada: DataTypes.BOOLEAN
  })
}
