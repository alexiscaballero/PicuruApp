module.exports = function(sequelize, DataTypes) {
  return sequelize.define("sucursal", {
    idSucursal: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    direccion: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    /* Cambiar por las clases */
    idCiudad: DataTypes.INTEGER,
    idEmpresa: DataTypes.INTEGER
  })
}
