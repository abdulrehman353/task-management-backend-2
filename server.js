require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const orgRoutes = require('./routes/organizationRoutes');

const app = express();

app.use(express.json());

// Swagger UI Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/orgs', orgRoutes);

app.get('/', (req, res) => {
  res.send('Task Management Server Running Successfully! Visit /api-docs for Swagger UI.');
});

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database connected and synced successfully!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });