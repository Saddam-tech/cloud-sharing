const mariadb = require("mariadb");
const config = require("./dbconfig.json");

var pool = mariadb.createPool(config);
pool.getConnection(function (err, conn) {
  if (!err) {
    // connection
    conn.query("SELECT NOW()");
  }
  conn.release();
});
