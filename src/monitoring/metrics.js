/**
 * Configuración Prometheus
 * ------------------------------------
 * Expondrá métricas default en /metrics
 */

const client = require('prom-client');
const register = new client.Registry();

client.collectDefaultMetrics({ register });

module.exports = { client, register };
