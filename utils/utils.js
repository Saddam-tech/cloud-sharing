const { v5: uuidv5 } = require("uuid");

const create_uuid_via_namespace = (str) =>
  uuidv5(str, Array.from(Array(16).keys()));

function generaterandomstr(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const generaterandomhex = (length) => {
  var result = "";
  var characters = "abcdef0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = {
  create_uuid_via_namespace,
  generaterandomstr,
  generaterandomhex,
};
