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

  test('Send 400 for not including a required user property', () => {
    const mockMotoToPost = {
      make: faker.lorem.words(3),
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

describe('Tests GET requests to api/motorcycles', () => {
  test('Send 200 for a successful GET of a motorcycle object', () => {
    let mockMotoForGet;
    return createMockMotoPromise()
      .then((testMoto) => {
        mockMotoForGet = testMoto;
        return superagent.get(`${apiUrl}/${mockMotoForGet._id}`);
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.user).toEqual(mockMotoForGet.user);
        expect(response.body.make).toEqual(mockMotoForGet.make);
        expect(response.body.model).toEqual(mockMotoForGet.model);
      })
      .catch((err) => {
        throw err;
      });
  });
  test('Send 404 GET: no motorcycle with this id', () => {
    return superagent.get(`${apiUrl}/THISISABADID`)
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(404);
      });
  });
});

describe('Tests PUT requests to api/motorcycles', () => {
  test('Send 200 for successful updating of a motorcycle', () => {
    return createMockMotoPromise()
      .then((newMoto) => {
        return superagent.put(`${apiUrl}/${newMoto._id}`)
          .send({ make: 'updated make', model: 'updated model' })
          .then((response) => {
            expect(response.status).toEqual(200);
            expect(response.body.make).toEqual('updated make');
            expect(response.body.model).toEqual('updated model');
            expect(response.body._id.toString()).toEqual(newMoto._id.toString());
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  });
});

// describe('Tests DELETE requests to api/motorcycles', () => {
// test('Sends 200 for successful delete of one object', () => {
// return superagent.delete(`${apiUrl}/${mockMotoForGet._id}`)
// .then((response) => {
// expect(response.status).toEqual(200);
// })
// .catch((err) => {
// throw err;
// });
// });
// });
