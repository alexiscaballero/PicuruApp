module.exports = function(sequelize, DataTypes) {
  return sequelize.define("colectivo", {
    idColectivo: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    patente: DataTypes.STRING,
    modelo: DataTypes.STRING,
    marca: DataTypes.STRING,
    /* Cambiar por Clase Sucursal (no fk) */
    sucursal_fk: DataTypes.INTEGER
  })
}
