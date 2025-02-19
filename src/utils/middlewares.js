import { body } from "express-validator";
import jwt from "jsonwebtoken";
import userModel from "../config/models/users.model.js"; // Sequelize User Model
import productModel from "../config/models/product.model.js"; // Sequelize Product Model

// Verificar el token
export const verifyToken = (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;

    if (!headerToken) {
      console.log("Token no encontrado en el encabezado.");
      return res
        .status(401)
        .send({ status: "ERR", data: "Se requiere header con token válido" });
    }

    const token = headerToken.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.log("Token ha expirado.");
          return res
            .status(401)
            .send({ status: "ERR", data: "El token ha expirado" });
        } else {
          console.log("Token no es válido.");
          return res
            .status(401)
            .send({ status: "ERR", data: "El token no es válido" });
        }
      }

      req.loggedInUser = {
        ...decoded,
        rol: decoded.rol,
      };
      next();
    });
  } catch (err) {
    console.error("Error en verifyToken:", err);
    return res.status(500).send({ status: "ERR", data: err.message });
  }
};

// Verifica si el email enviado en el body ya se encuentra registrado
export const checkRegistered = async (req, res, next) => {
  try {
    const existingUser = await userModel.findOne({
      where: { email: req.body.email },
    });

    if (!existingUser) {
      next();
    } else {
      res.status(400).json({
        status: "ERR",
        data: "El correo electrónico ya está registrado",
      });
    }
  } catch (err) {
    console.error("Error al verificar el usuario:", err);
    res.status(500).json({
      status: "ERR",
      data: "Error al verificar el correo electrónico",
    });
  }
};

// Comprobar si se proporcionan campos requeridos en la solicitud
export const checkRequired = (requiredFields) => {
  return (req, res, next) => {
    try {
      for (const field of requiredFields) {
        if (!req.body[field]) {
          throw new Error(`El campo "${field}" es requerido`);
        }
      }
      next();
    } catch (error) {
      res.status(400).json({ status: "ERR", data: error.message });
    }
  };
};

// Valida los elementos del body utilizando express-validator
export const validateCreateFields = [
  body("name")
    .isLength({ min: 2, max: 32 })
    .withMessage("El nombre debe tener entre 2 y 32 caracteres"),
  body("email").isEmail().withMessage("El formato de mail no es válido"),
  body("password")
    .isLength({ min: 6, max: 12 })
    .withMessage("La clave debe tener entre 6 y 12 caracteres"),
];

// Valida los elementos del body para login
export const validateLoginFields = [
  body("email").isEmail().withMessage("El formato de mail no es válido"),
  body("password")
    .isLength({ min: 6, max: 12 })
    .withMessage("La clave debe tener entre 6 y 12 caracteres"),
];

// Verifica que el mail enviado en el body exista en la colección de usuarios
export const checkReadyLogin = async (req, res, next) => {
  try {
    const foundUser = await userModel.findOne({
      where: { email: req.body.email },
    });

    if (foundUser) {
      res.locals.foundUser = foundUser;
      next();
    } else {
      res.status(400).send({
        status: "ERR",
        data: "El email no se encuentra registrado",
      });
    }
  } catch (err) {
    res.status(500).send({
      status: "ERR",
      data: "Error al verificar el usuario para login",
    });
  }
};

// Verifica si el usuario es administrador
export const checkAdmin = (req, res, next) => {
  try {
    if (req.loggedInUser && req.loggedInUser.rol === "admin") {
      next();
    } else {
      res.status(403).json({
        status: "ERR",
        data: "Acceso denegado: no eres administrador",
      });
    }
  } catch (err) {
    res.status(500).json({ status: "ERR", data: err.message });
  }
};

// Quita campos del req.body respetando un array de permitidos
export const filterAllowed = (allowedFields) => {
  return (req, res, next) => {
    req.filteredBody = {};

    for (const key in req.body) {
      if (allowedFields.includes(key)) req.filteredBody[key] = req.body[key];
    }

    next();
  };
};

// Obtener los productos disponibles
export const getAvailableProducts = async (req, res) => {
  try {
    const availableProducts = await productModel.findAll({
      where: { available: true },
    });

    console.log("Available Products:", availableProducts);

    res.status(200).json({ status: "OK", data: availableProducts });
  } catch (error) {
    res.status(500).json({ status: "ERR", error: error.message });
  }
};
