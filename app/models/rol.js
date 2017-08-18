module.exports = function(sequelize, DataTypes) {
  return sequelize.define("rol", {
    idRol: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    descripcion: DataTypes.STRING
  })
}
