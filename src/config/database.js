import { Sequelize } from 'sequelize';
import dotenv from "dotenv";

dotenv.config();

// Crear instancia de Sequelize y conectar a MySQL
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: process.env.MYSQL_DIALECT,
    logging: false, // Cambia a true si quieres ver las consultas SQL en consola
  }
);

// Verificar la conexión
const connectDB = async () => {
  try {
    await sequelize.authenticate();  // Usamos await para esperar a que se complete la conexión
    console.log('Conexión a la base de datos MySQL establecida con éxito.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos MySQL:', error);
  }
};

// Llamar a la función para verificar la conexión
connectDB();

export default sequelize;