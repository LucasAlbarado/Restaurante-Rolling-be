import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  table: {
    type: DataTypes.STRING,
    defaultValue: '0',
  },
  rol: {
    type: DataTypes.STRING,
    defaultValue: 'cliente',
  },
}, {
  // Opciones adicionales, como el nombre de la tabla y el comportamiento de timestamps
  tableName: 'users', // Asegura que la tabla se llame "users"
});

export default User;
