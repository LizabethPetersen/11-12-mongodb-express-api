'use strict';

import faker from 'faker';
import superagent from 'superagent';
import Note from '../model/build-moto';
import { startServer, stopServer } from '../lib/server';

const apiUrl = `http://localhost:${process.env.PORT}/api/v1/motorcycles`;

const createMockMotoPromise = () => {
  return new Note({
    make: faker.lorem.words(2),
    model: faker.lorem.words(7),
    user: faker.lorem.word(1),
  }).save();
};

beforeAll(startServer);
afterAll(stopServer);

afterEach(() => Note.remove({}));

describe('Tests POST requests to /api/v1/motorcycles', () => {
  test('Send 200 for successful build of motorcycle object', () => {
    const mockMotoToPost = {
      make: faker.lorem.words(2),
      model: faker.lorem.words(7),
    };
    return superagent.post(apiUrl)
      .send(mockMotoToPost)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.make).toEqual(mockMotoToPost.make);
        expect(response.body.model).toEqual(mockMotoToPost.model);
        expect(response.body.user).toEqual(mockMotoToPost.user);
        expect(response.body._id).toBeTruthy();
        expect(response.body.createdOn).toBeTruthy();
      })
      .catch((err) => {
        throw err;
      });
  });

  test('Send 400 for not including a required MAKE property', () => {
    const mockMotoToPost = {
      model: faker.lorem.words(7),
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
          .send({ make: newMoto.make, user: newMoto.user })
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
