/**
 * Microservicio Perfil del Usuario
 * ------------------------------------
 * - /graphql para API GraphQL
 * - /metrics para Prometheus
 */

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');
const schema = require('./graphql/schema');
const connectDB = require('./config/db');
const metrics = require('./monitoring/metrics');

require('dotenv').config();

const app = express();
app.use(cors());

// Endpoint GraphQL
app.use('/graphql', graphqlHTTP((req) => ({
    schema,
    graphiql: true,
    context: { headers: req.headers }
})));

// Endpoint Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
});

// Conectar DB y arrancar server
connectDB();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 User-Service corriendo en puerto ${PORT}`));
