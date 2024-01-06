const produkModel = require("../models/index").produk;
const Op = require("sequelize").Op;
const upload = require("./upload-foto").single("gambar_barang");
const path = require("path");
const fs = require("fs");

exports.addProduct = (request, response) => {
	upload(request, response, async (error) => {
		if (error) {
			console.log(error);
			return response.json({ message: error });
		}
		if (!request.file) {
			return response.json({ message: "file nya dimana" });
		}

		let newProduct = {
			nama_barang: request.body.nama_barang,
			gambar_barang: request.file.filename,
			kategori: request.body.kategori,
			harga: request.body.harga,
			stok: request.body.stok,
		};

		produkModel
			.create(newProduct)
			.then((result) => {
				return response.json({
					success: true,
					data: result,
					message: "new product has been inserted",
				});
			})
			.catch((error) => {
				return response.json({
					success: false,
					message: error.message,
				});
			});
	});
};

// exports.adduser = (request, response) => {
// 	upload(request, response, async (error) => {
// 		if (error) {
// 			return response.json({ message: error });
// 		}
// 		if (!request.file) {
// 			return response.json({ message: "file nya dimana" });
// 		}

// 		let Newuser = {
// 			nama_user: request.body.nama_user,
// 			foto: request.file.filename,
// 			email: request.body.email,
// 			password: md5(request.body.password),
// 			role: request.body.role,
// 		};

// 		userModel
// 			.create(Newuser)
// 			.then((result) => {
// 				return response.json({
// 					success: true,
// 					data: result,
// 					message: "ippe user baru",
// 				});
// 			})
// 			.catch((error) => {
// 				return response.json({
// 					success: false,
// 					message: error.message,
// 				});
// 			});
// 	});
// };
