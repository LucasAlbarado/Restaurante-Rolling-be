import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRoutes from './src/config/routes/users.routes.js';
import productsRoutes from './src/config/routes/products.routes.js';
import ordersRoutes from './src/config/routes/orders.routes.js';
import statsRoutes from './src/config/routes/stats.routes.js';
import sequelize from './src/config/database.js';  // Nueva importación de Sequelize

// Cargar variables de entorno
dotenv.config();

// Inicializar app
const app = express();

// Configurar puerto y URL
const EXPRESS_PORT = process.env.EXPRESS_PORT || 3236;

// Habilitar cors y middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/users', usersRoutes());
app.use('/api/products', productsRoutes());
app.use('/api/orders', ordersRoutes());
app.use('/api/stats', statsRoutes());

app.get('/', (req, res) => {
    res.send('¡Bienvenido a mi appi!');
});

// Manejo de errores
app.all('*', (req, res) => {
    res.status(404).send({ status: 'ERR', data: 'No se encuentra el endpoint solicitado' })
});

// Iniciar el servidor y conectar a la base de datos
app.listen(EXPRESS_PORT, async () => {
    try {
        // Probar la conexión a la base de datos
        await sequelize.authenticate();
        console.log('Conexión a MySQL establecida');
        console.log(`Backend inicializado en el puerto ${EXPRESS_PORT}`);
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    }
});
