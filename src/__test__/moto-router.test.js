'use strict';

import faker from 'faker';
import superagent from 'superagent';
import Moto from '../model/build-moto';
import { startServer, stopServer } from '../lib/server';

const apiUrl = `http://localhost:${process.env.PORT}/api/motorcycles`;

const createMockMotoPromise = () => {
  return new Moto({
    user: faker.lorem.words(2),
    make: faker.lorem.words(3),
    model: faker.lorem.words(3),
  }).save();
};

beforeAll(startServer);
afterAll(stopServer);

afterEach(() => Moto.remove({}));

describe('Tests POST requests to /api/motorcycles', () => {
  test('Send 200 for successful build of motorcycle object', () => {
    const mockMotoToPost = {
      user: faker.lorem.words(2),
      make: faker.lorem.words(3),
      model: faker.lorem.words(3),
    };
    return superagent.post(apiUrl)
      .send(mockMotoToPost)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.user).toEqual(mockMotoToPost.user);
        expect(response.body.make).toEqual(mockMotoToPost.make);
        expect(response.body.model).toEqual(mockMotoToPost.model);
        expect(response.body._id).toBeTruthy();
        expect(response.body.createdOn).toBeTruthy();
      })
      .catch((err) => {
        throw err;
      });
  });

  test('Send 400 for not including a required make property', () => {
    const mockMotoToPost = {
      user: faker.lorem.words(2),
      model: faker.lorem.words(3),
    };
    return superagent.post(apiUrl)
      .send(mockMotoToPost)
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('POST 409 for duplicate key', () => {
    return createMockMotoPromise()
      .then((newMoto) => {
        return superagent.post(apiUrl)
          .send({ user: newMoto.user, make: newMoto.make, model: newMoto.model })
          .then((response) => {
            throw response;
          })
          .catch((err) => {
            expect(err.status).toEqual(409);
          });
      })
      .catch((err) => {
        throw err;
      });
  });
});
