/**
 * ThinkSpace Monitoring & Observability
 * Enterprise-grade monitoring structure.
 */

const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'thinkspace-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

module.exports = logger;
