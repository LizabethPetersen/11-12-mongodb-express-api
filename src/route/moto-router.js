'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import Moto from '../model/build-moto';
import logger from '../lib/logger';

const jsonParser = bodyParser.json();
const motoRouter = new Router();

motoRouter.post('/api/motorcycles', jsonParser, (request, response, next) => {
  logger.log(logger.INFO, 'Moto-Router POST to /api/motorcycles - processing a request');
  if (!request.body.user) {
    logger.log(logger.INFO, 'Moto-Router POST /api/motorcycles: Responding with 400 error for no included user');
    const error = new Error('No user provided');
    error.status = 400;
    return next(error);
  }

  Moto.init()
    .then(() => {
      return new Moto(request.body).save();
    })
    .then((newMoto) => {
      logger.log(logger.INFO, `Moto-Router POST: A new motorcycle was built: ${JSON.stringify(newMoto)}`);
      return response.json(newMoto);
    })
    .catch(next);
  return undefined;
});

motoRouter.get('/api/motorcycles/:id?', (request, response, next) => {
  logger.log(logger.INFO, 'Moto-Router GET /api/motorcycles/:id = Processing a request');
  if (!request.params.id) {
    logger.log(logger.INFO, 'Moto-Router GET /api/motorcycles: Responding with a 404 error code for no objects found');
    return response(404, {});
  }
  return Moto.findOne({ _id: request.params.id })
    .then((moto) => {
      if (!moto) {
        logger.log(logger.INFO, 'Moto-Router GET: Responding with 404 status code for no motorcycle found');
        return response.sendStatus(404);
      }
      logger.log(logger.INFO, 'Moto-Router GET: Responding with 200 status code for successful get');
      return response.json(moto);
    })
    .catch(next);
});

motoRouter.put('/api/motorcycles/:id?', jsonParser, (request, response, next) => {
  if (!request.params.id) {
    logger.log(logger.INFO, 'PUT /api/motorcycles: Responding with a 400 error code for no id passed in');
    return response.sendStatus(400);
  }

  const options = {
    new: true,
    runValidators: true,
  };

  Moto.init()
    .then(() => {
      return Moto.findByIdAndUpdate(request.params.id, request.body, options);
    })
    .then((updatedMoto) => {
      logger.log(logger.INFO, `PUT: Responding with a 200 status code for successfully updated motorcycle: ${JSON.stringify(updatedMoto)}`);
      return response.json(updatedMoto);
    })
    .catch(next);
  return undefined;
});

motoRouter.delete('/api/motorcycles/:id?', (request, response, next) => {
  logger.log(logger.INFO, 'Moto-Router DELETE /api/motorcycles/:id = Processing a request');
  if (!request.params.id) {
    logger.log(logger.INFO, 'Moto-Router DELETE /api/motorcycles: Responding with a 400 error code for no objects found');
    return response.sendStatus(400);
  }
  return Moto.findByIdAndRemove({ _id: request.params.id })
    .then((moto) => {
      if (!moto) {
        logger.log(logger.INFO, 'DELETE: Responding with 404 status code for no motorcycle found');
        return response.sendStatus(404);
      }
      logger.log(logger.INFO, 'DELETE: Responding with 204 status code for successful delete');
      return response.sendStatus(204);
    })
    .catch(next);
});

export default motoRouter;
