module.exports = function(sequelize, DataTypes) {
  return sequelize.define("persona", {
    idPersona: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    dni: DataTypes.BIGINT,
    nombre: DataTypes.STRING
  })
}
