const express = require("express");
const app = express();
const auth = require("../auth/auth");
const receiptController = require("../controllers/receipt.controller");
const { checkRole } = require("../middleware/checkRole");

app.get("/history", auth.authVerify, receiptController.getTransactionHistory);
app.get("/:id", auth.authVerify, receiptController.getUserReceipt);
app.get(
	"/merchant/purchases",
	auth.authVerify,
	checkRole(["seller", "admin"]),
	receiptController.getRecentPurchase
);

module.exports = app;
