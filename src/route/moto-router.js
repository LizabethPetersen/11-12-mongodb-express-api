'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import Moto from '../model/build-moto';
import logger from '../lib/logger';

const jsonParser = bodyParser.json();
const motoRouter = new Router();

motoRouter.post('/api/motorcycles', jsonParser, (request, response) => {
  logger.log(logger.INFO, 'Moto-Router POST to /api/motorcycles - processing a request');
  if (!request.body.make) {
    logger.log(logger.INFO, 'Moto-Router POST /api/motorcycles: Responding with 400 error for no included make');
    return response.sendStatus(400);
  }

  Moto.init()
    .then(() => {
      return new Moto(request.body).save();
    })
    .then((newMoto) => {
      logger.log(logger.INFO, `Moto-Router POST: A new motorcycle was built: ${JSON.stringify(newMoto)}`);
      return response.json(newMoto);
    })
    .catch((err) => {
      // we will hit here if we have some misc. mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `PUT: Responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `PUT: Responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }

      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `PUT: Responding with 409 status code for duplicate key ${err.message}`);
        return response.sendStatus(409);
      }

      logger.log(logger.ERROR, `GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500); // Internal Server Error
    });
  return undefined;
});

motoRouter.get('/api/motorcycles/:id?', (request, response) => {
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
    .catch((err) => {
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `Moto-Router PUT: Responding with 404 status code to mongdb error, objectId ${request.params.id} failed`);
        return response.sendStatus(404);
      }

      logger.log(logger.ERROR, `Moto-Router GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
});

motoRouter.put('/api/motorcycles/:id?', jsonParser, (request, response) => {
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
    .catch((err) => {
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `PUT: Responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `PUT: Responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }

      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `PUT: Responding with 409 status code for duplicate key ${err.message}`);
        return response.sendStatus(409);
      }

      logger.log(logger.ERROR, `GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
  return undefined;
});

motoRouter.delete('/api/motorcycles/:id?', (request, response) => {
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
    .catch((err) => {
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `Moto-Router DELETE: 404 status code to mongodb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }
      logger.log(logger.ERROR, `Moto-Router DELETE: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
});

export default motoRouter;
