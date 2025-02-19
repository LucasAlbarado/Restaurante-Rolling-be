import { Router } from "express";
import { checkAdmin, checkRequired, filterAllowed, verifyToken } from "../../utils/middlewares.js";
import Product  from "../models/product.model.js"; 

const productsRoutes = () => {
  const router = Router();

  // Aplica verificación de token para todas las rutas
  // router.use(verifyToken);

  // Ruta para obtener productos disponibles (por ejemplo, "menu")
  router.get("/menu", async (req, res) => {
    try {
      const products = await Product.findAll({
        where: { available: true },  // Filtra productos disponibles
      });

      res.status(200).json({ status: "OK", data: products });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        data: "Error al obtener la lista de productos",
      });
    }
  });

  // Aplica verificación de token y admin para las rutas que requieran permisos especiales
  // router.use(checkAdmin);

  // Ruta para listar productos (solo admin)
  router.get("/list", async (req, res) => {
    try {
      const products = await Product.findAll();

      res.status(200).json({ status: "OK", data: products });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        data: "Error al obtener la lista de productos",
      });
    }
  });

  // Ruta para obtener un producto por ID
  router.get("/getproduct/:id", async (req, res) => {
    try {
      const productId = req.params.id;

      const product = await Product.findByPk(productId);  // Usar findByPk para buscar por ID

      if (!product) {
        return res.status(404).json({
          status: "ERR",
          data: "El producto no fue encontrado",
        });
      }

      res.status(200).json({
        status: "OK",
        data: product,
      });
    } catch (error) {
      console.error("Error al obtener el producto por ID:", error);
      res.status(500).json({
        status: "ERR",
        data: "Error al obtener el producto por ID",
      });
    }
  });

  // Ruta para actualizar un producto por ID
  router.put(
    "/update/:id",
    filterAllowed(["name", "description", "price", "image"]),
    async (req, res) => {
      try {
        const id = req.params.id;
        const updatedProduct = await Product.update(req.body, {
          where: { id },
          returning: true,  // Retorna el producto actualizado
        });

        if (updatedProduct[0] === 0) {
          return res.status(404).json({
            status: "ERR",
            data: "No existe producto con ese ID",
          });
        }

        res.status(200).json({
          status: "OK",
          data: updatedProduct[1][0],  // El primer índice contiene el producto actualizado
        });
      } catch (err) {
        console.error("Error al actualizar el producto:", err);
        res.status(500).json({ status: "ERR", data: err.message });
      }
    }
  );

  // Ruta para crear un nuevo producto
  router.post(
    "/create",
    checkRequired(["name", "description", "price", "image"]),
    async (req, res) => {
      try {
        const existingProduct = await Product.findOne({
          where: { name: req.body.name },
        });

        if (existingProduct) {
          return res.status(400).json({
            status: "ERR",
            data: "El nombre del producto ya está en uso.",
          });
        }

        const newProductData = {
          ...req.body,
        };

        const newProduct = await Product.create(newProductData);

        res.status(201).json({ status: "OK", data: newProduct });
      } catch (error) {
        console.error("Error al crear el producto:", error);
        res.status(500).json({ status: "ERR", data: error.message });
      }
    }
  );

  // Ruta para eliminar un producto por ID
  router.delete("/delete/:id", async (req, res) => {

    try {
      const productId = req.params.id;
    /*  manejo de error no permite eliminar
      console.log("🔍 ID recibido:", productId); //para saber que id llega
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          status: "ERR",
          data: "ID inválido o no proporcionado",
        });
      }

      //aqui esta el manejo de error del id
      console.log("ID recibido en backend:", productId); // Añade este log
      if (!productId) {
        return res.status(400).json({
          status: "ERR",
          data: "ID del producto no proporcionado",
        });
      }

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          status: "ERR",
          data: "ID inválido o no proporcionado",
        });
      }

      //aqui */

      const deletedProduct = await Product.destroy({
        where: { id: productId },
      });

      if (deletedProduct === 0) {
        return res.status(404).json({
          status: "ERR",
          data: "No existe producto con ese ID",
        });
      }

      res.status(200).json({
        status: "OK",
        data: "Producto eliminado con éxito",
      });
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      res.status(500).json({
        status: "ERR",
        data: error.message,
      });
    }
  });

  return router;
};

export default productsRoutes;
