const express = require("express");
const app = express();
const alamatController = require("../controllers/alamat.controller");
const auth = require("../auth/auth");

app.post("/", auth.authVerify, alamatController.addAddress);

module.exports = app;
