const express = require("express");
const app = express();
const upload = require(`../controllers/upload-foto`);
const produkController = require("../controllers/produk.controller");

app.post("/", produkController.addProduct);
module.exports = app;
