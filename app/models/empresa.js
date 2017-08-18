module.exports = function(sequelize, DataTypes) {
  return sequelize.define("empresa", {
    idEmpresa: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    empresa: DataTypes.STRING
  })
}
