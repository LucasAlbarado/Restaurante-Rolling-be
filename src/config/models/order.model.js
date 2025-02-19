import { DataTypes } from 'sequelize';
import sequelize from '../database.js';
import User from './users.model.js';  

const Order = sequelize.define('Order', {
  mesa: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productos: {
    type: DataTypes.JSONB, // Utilizamos JSONB para manejar arrays, pero en MySQL puede ser JSON
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'en espera',
    validate: {
      isIn: [['en espera', 'pedido realizado']],
    },
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Relación con 'User' (relación de clave foránea)
Order.belongsTo(User, { foreignKey: 'cliente', as: 'usuario' });

export default Order;