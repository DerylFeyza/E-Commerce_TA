const userModel = require("../models/index").user;
const Op = require("sequelize").Op;
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const SECRET_KEY = "secretcode";

exports.login = async (request, response) => {
	try {
		const params = {
			email: request.body.email,
			password: request.body.password,
		};

		const findUser = await userModel.findOne({
			where: { email: params.email },
		});

		if (findUser == null) {
			return response.json({
				success: false,
				message: "email or password doesnt match",
			});
		}

		const valid = await bcrypt.compare(params.password, findUser.password);
		if (!valid) {
			return response.json({
				success: false,
				message: "email or password doesnt match",
			});
		}

		let tokenPayLoad = {
			id_user: findUser.id,
			email: findUser.email,
			username: findUser.username,
			role: findUser.role,
		};

		tokenPayLoad = JSON.stringify(tokenPayLoad);
		let token = jsonwebtoken.sign(tokenPayLoad, SECRET_KEY);

		return response.status(200).json({
			message: "Success Login",
			success: true,
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
		return response.status(500).json({
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
			password: await bcrypt.hash(request.body.password, 10),
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

exports.findUser = async (request, response) => {
	let keyword = request.body.keyword;
	let users = await userModel.findAll({
		where: {
			[Op.or]: [
				{ username: { [Op.substring]: keyword } },
				{ role: { [Op.substring]: keyword } },
				{ email: { [Op.substring]: keyword } },
			],
		},
	});
	return response.json({
		success: true,
		data: users,
		message: "user found",
	});
};

exports.updateUser = (request, response) => {
	let datauser = {
		username: request.body.username,
		role: request.body.role,
		email: request.body.email,
	};
	let iduser = request.params.id;
	userModel
		.update(datauser, { where: { id: iduser } })
		.then((result) => {
			return response.json({
				success: true,
				message: "User data has been succesfully updated",
			});
		})
		.catch((error) => {
			return response.json({
				success: false,
				message: error.message,
			});
		});
};

exports.userChangeDetails = (request, response) => {
	let datauser = {
		username: request.body.username,
		email: request.body.email,
	};
	let iduser = request.userData.id_user;
	userModel
		.update(datauser, { where: { id: iduser } })
		.then((result) => {
			return response.json({
				success: true,
				message: "your data has been succesfully updated",
			});
		})
		.catch((error) => {
			return response.json({
				success: false,
				message: error.message,
			});
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

exports.getUserById = async (id) => {
	try {
		const data = await userModel.findByPk(id);
		return data;
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

exports.userToSeller = async (request, response) => {
	const idUser = request.userData.id_user;
	const data = {
		nama_toko: request.body.namatoko,
		password: request.body.password,
	};
	try {
		const isUser = await userModel.findOne({
			where: { id: idUser, role: "customer" },
		});
		if (!isUser) {
			return response.status(400).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const valid = await bcrypt.compare(data.password, isUser.password);
		if (!valid) {
			return response.status(400).json({
				success: false,
				message: "email or password doesnt match",
			});
		}

		await userModel.update(
			{ role: "seller", nama_toko: data.nama_toko },
			{ where: { id: idUser } }
		);
		let tokenPayLoad = {
			id_user: isUser.id,
			email: isUser.email,
			username: isUser.username,
			role: "seller",
		};

		tokenPayLoad = JSON.stringify(tokenPayLoad);
		let token = jsonwebtoken.sign(tokenPayLoad, SECRET_KEY);

		return response.status(200).json({
			message: "Role Updated and success Login",
			success: true,
			data: {
				token: token,
				id_user: isUser.id,
				email: isUser.email,
				username: isUser.username,
				role: "seller",
			},
		});
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};
