// build and export your unconnected client here

const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/fitnesstrackr'
const client = new Client(connectionString);

module.exports = client
