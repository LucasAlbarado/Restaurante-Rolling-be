import User from './users.model.js';
import Order from './order.model.js';

// Definir relaciones aquí
User.hasMany(Order, { foreignKey: 'cliente', as: 'ordenes' });
Order.belongsTo(User, { foreignKey: 'cliente', as: 'usuario' });

export { User, Order };
