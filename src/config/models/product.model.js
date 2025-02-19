import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,  // Este campo será la clave primaria
    autoIncrement: true,  // Si deseas que el ID se incremente automáticamente
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,  // Si prefieres un tipo de dato numérico, puedes usar DataTypes.FLOAT o DataTypes.INTEGER
    allowNull: false,
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,  // Asigna un valor por defecto
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'product',  // Asegura que la tabla se llame 'products'
  timestamps: false,  // Desactiva las columnas createdAt y updatedAt si no las necesitas
});

export default Product;
