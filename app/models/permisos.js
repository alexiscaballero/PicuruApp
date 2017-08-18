module.exports = function(sequelize, DataTypes) {
  return sequelize.define("permisos", {
    idPermiso: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    /* Cambiar por clase Rol y Funciones */
    idRol: DataTypes.INTEGER,
    idFunciones: DataTypes.INTEGER
  })
}
