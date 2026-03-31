/* Minimal structured logger — swap for winston/pino in production */
const timestamp = () => new Date().toISOString();

module.exports = {
  info: (msg) => console.log(`[${timestamp()}] INFO  ${msg}`),
  warn: (msg) => console.warn(`[${timestamp()}] WARN  ${msg}`),
  error: (msg) => console.error(`[${timestamp()}] ERROR ${msg}`),
};
