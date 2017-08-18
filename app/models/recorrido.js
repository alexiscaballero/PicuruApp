module.exports = function(sequelize, DataTypes) {
  return sequelize.define("recorrido", {
    idRecorrido: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    ramal: DataTypes.STRING
  })
}
