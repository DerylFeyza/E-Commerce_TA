const express = require("express");
const app = express();
const alamatController = require("../controllers/alamat.controller");
const auth = require("../auth/auth");

app.post("/", auth.authVerify, alamatController.addAddress);
app.delete("/", auth.authVerify, alamatController.deleteAddress);
app.put("/", auth.authVerify, alamatController.updateAddress);
app.get("/user", auth.authVerify, alamatController.getUserAddress);

module.exports = app;
