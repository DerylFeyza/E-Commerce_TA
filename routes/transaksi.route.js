const express = require("express");
const app = express();
const auth = require("../auth/auth");
const transaksiController = require("../controllers/transaksi.controller");

app.post("/", auth.authVerify, transaksiController.productToCart);
app.post("/checkout", auth.authVerify, transaksiController.checkout);
app.delete("/:id", auth.authVerify, transaksiController.removeProductFromCart);

module.exports = app;
