const express = require("express");
const app = express();
const auth = require("../auth/auth");
const cartController = require("../controllers/cart.controller");

app.get("/", auth.authVerify, cartController.getCartOnDraft);
app.get("/history", auth.authVerify, cartController.getTransactionHistory);

module.exports = app;
