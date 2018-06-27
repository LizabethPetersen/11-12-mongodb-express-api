'use strict';

import express from 'express';
import mongoose from 'mongoose';
import logger from './logger';
import motoRouter from '../route/moto-router';

import loggerMiddleware from '../lib/middleware/logger-middleware';
import errorMiddleware from '../lib/middleware/error-middleware';

const app = express();
const PORT = process.env.PORT || 3000;
let server = null;

app.use(loggerMiddleware);

app.use(motoRouter);

app.use(errorMiddleware);

app.all('*', (request, response) => {
  logger.log(logger.INFO, 'SERVER: Returning a 404 status from the catch-all default route');
  return response.status(404).send('Route not registered');
});

const startServer = () => {
  return mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      server = app.listen(PORT, () => {
        logger.log(logger.INFO, `Server is listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      throw err;
    });
};

const stopServer = () => {
  return mongoose.disconnect()
    .then(() => {
      server.close(() => {
        logger.log(logger.INFO, 'Server is off');
      });
    })
    .catch((err) => {
      throw err;
    });
};

export { startServer, stopServer };
