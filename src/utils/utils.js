import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import orderModel from "../config/models/order.model.js"; // Sequelize Order Model
import userModel from "../config/models/users.model.js"; // Sequelize User Model
import productModel from "../config/models/product.model.js"; // Sequelize Product Model

// Función para crear un hash de una contraseña
export const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

// Función para generar un token JWT
export const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  return token;
};

// Función para verificar si una contraseña es válida
export const isValidPassword = (userInDb, pass) => {
  return bcrypt.compareSync(pass, userInDb.password);
};

// Función para filtrar datos y eliminar campos no deseados
export const filterData = (data, unwantedFields) => {
  const { ...filteredData } = data;
  unwantedFields.forEach((field) => delete filteredData[field]);
  return filteredData;
};

// Filtrar campos permitidos en la solicitud
export const filterAllowed = (allowedFields) => {
  return (req, res, next) => {
    req.filteredBody = {};

    for (const key in req.body) {
      if (allowedFields.includes(key)) req.filteredBody[key] = req.body[key];
    }

    next();
  };
};

// Función para crear pedidos
export const createOrder = async (orderData) => {
  try {
    if (typeof orderData !== "object" || orderData === null) {
      throw new Error("orderData is not a valid object");
    }

    let total = 0;
    if (orderData.productos && Array.isArray(orderData.productos)) {
      orderData.productos.forEach((producto) => {
        total += producto.precio * producto.cantidad;
      });
      orderData.total = total;
    }

    // Crear un nuevo pedido en la base de datos usando Sequelize
    const newOrder = await orderModel.create(orderData);

    return newOrder;
  } catch (error) {
    throw error;
  }
};

// Función para obtener pedidos por estado
export const getOrdersByStatus = async (status) => {
  try {
    // Obtener pedidos por estado usando Sequelize
    const orders = await orderModel.findAll({
      where: { estado: status },
      include: [{ model: userModel, as: "cliente" }],
    });

    return orders;
  } catch (error) {
    throw error;
  }
};

// Función para actualizar el estado del pedido por su ID
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const updatedOrder = await orderModel.update(
      { estado: newStatus },
      { where: { id: orderId }, returning: true }
    );

    return updatedOrder[1][0]; // Retorna el pedido actualizado
  } catch (error) {
    throw error;
  }
};

// Función para obtener estadísticas de pedidos
export const getOrdersStats = async () => {
  try {
    const totalOrders = await orderModel.count();

    const totalSales = await orderModel.sum("total");

    const topProducts = await orderModel.findAll({
      attributes: [
        [Sequelize.json("productos.nombre"), "name"],
        [Sequelize.fn("sum", Sequelize.col("productos.cantidad")), "totalQuantity"],
      ],
      group: ["productos.nombre"],
      order: [[Sequelize.fn("sum", Sequelize.col("productos.cantidad")), "DESC"]],
      limit: 10,
    });

    const topClients = await orderModel.findAll({
      attributes: [
        [Sequelize.col("cliente_id"), "clientId"],
        [Sequelize.fn("count", Sequelize.col("id")), "totalOrders"],
      ],
      group: ["cliente_id"],
      order: [[Sequelize.fn("count", Sequelize.col("id")), "DESC"]],
      limit: 10,
    });

    const topClientsWithNames = await userModel.findAll({
      where: {
        id: topClients.map((client) => client.clientId),
      },
      attributes: ["id", "name"],
    });

    const statistics = {
      totalOrders,
      totalSales: totalSales || 0,
      topProducts: topProducts.map((product) => ({
        name: product.name,
        totalQuantity: product.totalQuantity,
      })),
      topClients: topClientsWithNames.map((client) => ({
        id: client.id,
        name: client.name,
        totalOrders: topClients.find(
          (c) => c.clientId === client.id
        ).totalOrders,
      })),
    };

    return statistics;
  } catch (error) {
    throw error;
  }
};
