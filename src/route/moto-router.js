'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import Moto from '../model/build-moto';
import logger from '../lib/logger';

const jsonParser = bodyParser.json();
const motoRouter = new Router();

motoRouter.post('/api/notes', jsonParser, (request, response) => {
  logger.log(logger.INFO, 'Moto-Router POST to /api/v1/motorcycles - processing a request');
  if (!request.body.title) {
    logger.log(logger.INFO, 'Moto-Router POST /api/v1/motorcycles: Responding with 400 error for no make');
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
      if (err.message.toLowerCase().includes('Cast to objectid failed')) {
        logger.log(logger.ERROR, `Moto-Router PUT: Responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      if (err.message.toLowerCase().includes('Validation failed')) {
        logger.log(logger.ERROR, `Moto-Router PUT: Responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }

      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `Moto-Router PUT: Responding with 409 status code for duplicate key ${err.message}`);
        return response.sendStatus(409);
      }

      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `Moto-Router GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500); // Internal Server Error
    });
  return undefined;
});

// you need this question mark after ":id" or else Express will skip to the catch-all in lib/server.js 
motoRouter.get('/api/notes/:id?', (request, response) => {
  logger.log(logger.INFO, 'Moto-Router GET /api/v1/motorcycles/:id = Processing a request');

  // TODO:
  // if (!request.params.id) do logic here to return an array of all resources, else do the logic below

  return Moto.findOne({ _id: request.params.id })
    .then((moto) => {
      if (!moto) {
        logger.log(logger.INFO, 'Moto-Router GET /api/v1/motorcycles/:id: Responding with 404 status code for no motorcycle found');
        return response.sendStatus(404);
      }
      logger.log(logger.INFO, 'Moto-Router GET /api/v1/motorcycles/:id: Responding with 200 status code for successful get');
      return response.json(moto);
    })
    .catch((err) => {
      if (err.message.toLowerCase().includes('Cast to objectid failed')) {
        logger.log(logger.ERROR, `Moto-Router PUT: Responding with 404 status code to mongdb error, objectId ${request.params.id} failed`);
        return response.sendStatus(404);
      }

      logger.log(logger.ERROR, `Moto-Router GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
});

motoRouter.put('/api/v1/motorcycles/:id?', jsonParser, (request, response) => {
  if (!request.params.id) {
    logger.log(logger.INFO, 'Moto-Router PUT /api/v1/motorcycles: Responding with a 400 error code for no id passed in');
    return response.sendStatus(400);
  }

  // we need to pass these options into "findByIdAndUpdate" so we can actually return the newly modified document in the promise per "new", and "runValidators" ensures that the original validators we set on the model
  const options = {
    new: true,
    runValidators: true,
  };

  Moto.init()
    .then(() => {
      return Moto.findByIdAndUpdate(request.params.id, request.body, options);
    })
    .then((updatedMoto) => {
      logger.log(logger.INFO, `Moto-Router PUT: Responding with a 200 status code for successfully updated motorcycle: ${JSON.stringify(updatedMoto)}`);
      return response.json(updatedMoto);
    })
    .catch((err) => {
      if (err.message.toLowerCase().includes('Cast to objectid failed')) {
        logger.log(logger.ERROR, `Moto-Router PUT: Responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `Moto-Router PUT: Responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }

      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `Moto-Router PUT: Responding with 409 status code for duplicate key ${err.message}`);
        return response.sendStatus(409);
      }

      logger.log(logger.ERROR, `Moto-Router GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
  return undefined;
});

export default motoRouter;
