import { Router } from "express";
import { verifyToken, checkAdmin } from "../../utils/middlewares.js";
import {
  createOrder,
  getOrdersByStatus,
  updateOrderStatus,
} from "../../utils/utils.js";

const ordersRoutes = () => {
  const router = Router();

  // Crear pedidos por el cliente (requiere autenticación)
  router.post("/create", verifyToken, async (req, res) => {
    try {
      const clientId = req.loggedInUser._id;  // Asegúrate de que el usuario esté autenticado
      const orderData = req.body;

      orderData.cliente = clientId;

      const newOrder = await createOrder(orderData);  // Llama al método que creará el pedido

      res.status(201).json({ status: "OK", data: newOrder });
    } catch (error) {
      res.status(500).json({ status: "ERR", error: error.message });
    }
  });

  // Visualizar pedidos por estado (ejemplo: /api/orders/en%20espera)
  router.get("/:status", async (req, res) => {
    try {
      const status = req.params.status;

      const orders = await getOrdersByStatus(status);  // Llama al método que obtiene los pedidos por estado

      res.status(200).json({ status: "OK", data: orders });
    } catch (error) {
      res.status(500).json({ status: "ERR", error: error.message });
    }
  });

  // Actualizar el estado de un pedido por su ID (requiere permisos de admin)
  router.put("/status/:id", verifyToken, checkAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const newStatus = req.body.estado;  // El nuevo estado debe enviarse en el cuerpo de la solicitud
      const updatedOrder = await updateOrderStatus(orderId, newStatus);  // Llama al método para actualizar el estado

      res.status(200).json({ status: "OK", data: updatedOrder });
    } catch (error) {
      res.status(500).json({ status: "ERR", error: error.message });
    }
  });

  return router;
};

export default ordersRoutes;
