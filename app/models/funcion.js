module.exports = function(sequelize, DataTypes) {
  	return sequelize.define("funcion", {
	    FUN_ID: {
	    	type: DataTypes.INTEGER,
	    	primaryKey: true
	    },
	    FUN_TITULO: DataTypes.TEXT,
	    FUN_DESCRIPCION: DataTypes.TEXT,
	    FUN_ICONO: DataTypes.TEXT,
	    FUN_PADRE_ID: DataTypes.TEXT,
	    FUN_RUTA: DataTypes.TEXT,
	    FUN_ES_PADRE: DataTypes.BOOLEAN,
	    FUN_ORDEN: DataTypes.INTEGER
  	})
}
