const userModel = require("../models/index").user;
const Op = require("sequelize").Op;
const md5 = require("md5");
const jsonwebtoken = require("jsonwebtoken");
const SECRET_KEY = "secretcode";

exports.login = async (request, response) => {
	try {
		const params = {
			email: request.body.email,
			password: md5(request.body.password),
		};
		const findUser = await userModel.findOne({ where: params });
		if (findUser == null) {
			return response.status(400).json({
				message: "email or password doesnt match",
			});
		}
		console.log(findUser);
		let tokenPayLoad = {
			id_user: findUser.id,
			email: findUser.email,
			username: findUser.username,
			role: findUser.role,
		};
		tokenPayLoad = JSON.stringify(tokenPayLoad);
		let token = await jsonwebtoken.sign(tokenPayLoad, SECRET_KEY);
		return response.status(200).json({
			message: "Success Login",
			data: {
				token: token,
				id_user: findUser.id,
				email: findUser.email,
				username: findUser.username,
				role: findUser.role,
			},
		});
	} catch (error) {
		console.log(error);
		return response.status(400).json({
			message: error,
		});
	}
};

exports.userRegister = async (request, response) => {
	const email = request.body.email;
	let user = await userModel.findAll({
		where: { email: email },
	});
	if (user.length === 0) {
		let newUser = {
			username: request.body.username,
			role: "customer",
			email: request.body.email,
			password: md5(request.body.password),
		};

		if (
			newUser.username === "" ||
			newUser.email === "" ||
			newUser.password === ""
		) {
			return response.status(400).json({
				success: false,
				message: "form tidak lengkap",
			});
		} else {
			userModel
				.create(newUser)
				.then((result) => {
					return response.json({
						success: true,
						data: result,
						message: "new user has been inserted",
					});
				})
				.catch((error) => {
					return response.status(400).json({
						success: false,
						message: error.message,
					});
				});
		}
	} else {
		return response.json({
			success: true,
			data: user,
			message: "user sudah terdaftar, silahkan login",
		});
	}
};

exports.addUser = (request, response) => {
	let Newuser = {
		username: request.body.username,
		role: request.body.role,
		email: request.body.email,
		password: md5(request.body.password),
	};
	userModel
		.create(Newuser)
		.then((result) => {
			return response.json({
				success: true,
				data: result,
				message: "new user success",
			});
		})
		.catch((error) => {
			return response.json({
				success: false,
				message: error.message,
			});
		});
};

exports.getAlluser = async (request, response) => {
	let users = await userModel.findAll();
	return response.json({
		success: true,
		data: users,
		message: "yippe user ke load",
	});
};

exports.deleteUser = (request, response) => {
	const id = request.params.id;
	userModel
		.destroy({ where: { id: id } })
		.then((result) => {
			return response.json({
				success: true,
				message: "aa jangan dong delete user",
			});
		})
		.catch((error) => {
			return response.json({
				success: false,
				message: error.message,
			});
		});
};
