module.exports = function(sequelize, DataTypes) {
  return sequelize.define("turno", {
    idTurno: {
    	type: DataTypes.INTEGER,
    	primaryKey: true
    },
    horaInicio: DataTypes.TIME,
    horaFin: DataTypes.TIME,
    colectivo_fk: DataTypes.INTEGER,
    recorrido_fk: DataTypes.INTEGER,
    usuario_fk: DataTypes.INTEGER
  })
}
