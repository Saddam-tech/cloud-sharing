var app = require("../app");
var http = require("http");
require("dotenv").config();
console.log(process.env.JWT_SECRET);

const TESTPORT = 3001;

var PORT = normalizePort(process.env.PORT || TESTPORT);

app.set("port", PORT);

const server = http.createServer(app);

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }
  var port = PORT;
  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
}

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

server.listen(PORT);
server.on("error", onError);
server.on("listening", onListening);
console.log(`Listening ${PORT} @CLOUDSHARE`);
