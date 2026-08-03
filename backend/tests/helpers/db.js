// A real MongoDB for the integration tests.
//
// The older tests in this directory mock the Mongoose models, which is fine for
// checking that a route computed a number. It cannot check the things that
// actually matter about the subscription engine — that a unique index stops a
// second debit, that a query scoped to one customer really cannot see another's
// data — because those are properties of the database, not of the code around
// it. So these tests run against mongodb-memory-server.

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let server;

export const connectTestDb = async () => {
  server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri(), { dbName: 'milquu-test' });
  // The engine's idempotency and the sparse-unique identifiers are enforced by
  // indexes, so the tests are meaningless unless they have actually been built.
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).syncIndexes()));
};

export const clearTestDb = async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
};

export const closeTestDb = async () => {
  await mongoose.disconnect();
  if (server) await server.stop();
};
