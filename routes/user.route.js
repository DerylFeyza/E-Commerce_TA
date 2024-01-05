const express = require("express");
const app = express();
const userController = require("../controllers/user.controller");
const auth = require("../auth/auth");
const { checkRole } = require("../middleware/checkRole");

app.post("/login", userController.login);
app.post("/register", userController.userRegister);

app.post("/add", auth.authVerify, checkRole(["admin"]), userController.addUser);
app.get("/", auth.authVerify, checkRole(["admin"]), userController.getAlluser);
app.delete(
	"/delete/:id",
	auth.authVerify,
	checkRole(["admin"]),
	userController.deleteUser
);

// app.post(
// 	"/find",
// 	auth.authVerify,
// 	checkRole(["admin", "resepsionis"]),
// 	userController.finduser
// );
// app.put(
// 	"/:id",
// 	auth.authVerify,
// 	checkRole(["admin"]),
// 	userController.updateuser
// );
// app.delete(
// 	"/:id",
// 	auth.authVerify,
// 	checkRole(["admin"]),
// 	userController.deleteUser
// );
module.exports = app;
