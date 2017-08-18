module.exports = function(sequelize, DataTypes) {
  return sequelize.define("ciudades", {
    idCiudad: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    ciudad: DataTypes.TEXT,
    codigoPostal: DataTypes.TEXT
  })
}
