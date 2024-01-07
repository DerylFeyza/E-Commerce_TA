const express = require("express");
const app = express();
const transaksiController = require("../controllers/transaksi.controller");

app.post("/", transaksiController.productToCart);
module.exports = app;
