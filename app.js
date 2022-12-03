const express = require("express");
const app = express();
const path = require("path");
const indexRouter = require("./routes/main");
const usersRouter = require("./routes/users");
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");

require("dotenv").config();

app.use(cors());

app.use(fileUpload({ createParentPath: true }));

app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.post("/registrar", function (req, res) {
  console.log("Rota registrar");
  console.log("REQ.query...." + req.params.name);
  res.status(500).send("testing");
  //application.app.controles.login.registraUsuario(application, req, res);
});

module.exports = app;
