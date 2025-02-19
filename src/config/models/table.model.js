import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Table = sequelize.define('Table', {
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,  // Hacemos que el número de mesa sea único
  },
  qrCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'tables',  // Asegura que la tabla se llame 'tables'
  timestamps: false,    // Si no necesitas columnas createdAt y updatedAt
});

export default Table;
