const express = require("express");
const app = express();
const auth = require("../auth/auth");
const cartController = require("../controllers/cart.controller");

app.get("/", auth.authVerify, cartController.getCartOnDraft);

module.exports = app;
