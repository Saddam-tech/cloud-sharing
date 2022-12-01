const { v5: uuidv5 } = require("uuid");

const create_uuid_via_namespace = (str) =>
  uuidv5(str, Array.from(Array(16).keys()));

module.exports = { create_uuid_via_namespace };
