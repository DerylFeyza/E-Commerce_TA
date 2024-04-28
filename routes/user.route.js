const express = require("express");
const app = express();
const userController = require("../controllers/user.controller");
const auth = require("../auth/auth");
const { checkRole } = require("../middleware/checkRole");

app.post("/login", userController.login);
app.post("/register", userController.userRegister);
app.put(
	"/seller",
	auth.authVerify,
	checkRole(["customer"]),
	userController.userToSeller
);
app.put(
	"/update/:id",
	auth.authVerify,
	checkRole(["admin"]),
	userController.updateUser
);
app.put("/update", auth.authVerify, userController.userChangeDetails);
app.post("/add", auth.authVerify, checkRole(["admin"]), userController.addUser);
app.post(
	"/find",
	auth.authVerify,
	checkRole(["admin"]),
	userController.findUser
);
app.get("/info", auth.authVerify, userController.getUserInformation);
app.get("/", auth.authVerify, checkRole(["admin"]), userController.getAlluser);
app.delete(
	"/delete/:id",
	auth.authVerify,
	checkRole(["admin"]),
	userController.deleteUser
);
module.exports = app;
