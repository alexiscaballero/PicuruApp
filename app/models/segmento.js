module.exports = function(sequelize, DataTypes) {
  return sequelize.define("segmento", {
    idSegmento: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    /* Cambiar por clases, no son fk */
    idRecorrido: DataTypes.INTEGER,
    idUbicacionInicio: DataTypes.INTEGER,
    idUbicacionfin: DataTypes.INTEGER
  })
}
