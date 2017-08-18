module.exports = function(sequelize, DataTypes) {
  return sequelize.define("funciones", {
    idFuncion: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    funcion: DataTypes.STRING
  })
}
