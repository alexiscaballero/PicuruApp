module.exports = function(sequelize, DataTypes) {
  return sequelize.define("usuario", {
    id: {
    	type: DataTypes.STRING,
    	primaryKey: true
    },
    usuario: DataTypes.STRING,
    clave: DataTypes.STRING,
    /* Cambiar por clases, no son fk */
    idPersona: DataTypes.INTEGER,
    idRol: DataTypes.INTEGER
  })
}
