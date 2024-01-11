const produkModel = require("../models/index").produk;
const Op = require("sequelize").Op;
const upload = require("./upload-foto").single("gambar_barang");
const path = require("path");
const fs = require("fs");

exports.getallProduct = async (request, response) => {
	let products = await produkModel.findAll();
	return response.json({
		success: true,
		data: products,
		message: "all products has been loaded",
	});
};

exports.findProduct = async (request, response) => {
	let keyword = request.body.keyword;
	let product = await produkModel.findAll({
		where: {
			[Op.or]: [
				{ nama_barang: { [Op.substring]: keyword } },
				{ kategori: { [Op.substring]: keyword } },
				{ harga: { [Op.substring]: keyword } },
			],
		},
	});
	return response.json({
		success: true,
		data: product,
		message: "product with the sufficient filter has been shown",
	});
};

exports.addProduct = async (request, response) => {
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

exports.updateProduct = async (request, response) => {
	upload(request, response, async (error) => {
		if (error) {
			return response.json({ message: error });
		}
		let id = request.params.id;
		let dataproduk = {
			nama_barang: request.body.nama_barang,
			gambar_barang: request.file.filename,
			kategori: request.body.kategori,
			harga: request.body.harga,
			stok: request.body.stok,
		};
		if (request.file) {
			const selectedPhoto = await produkModel.findOne({
				where: { id: id },
			});
			const oldPhoto = selectedPhoto.gambar_barang;
			const pathPhoto = path.join(__dirname, `../fotoproduk`, oldPhoto);
			if (fs.existsSync(pathPhoto)) {
				fs.unlinkSync(pathPhoto, (error) => console.log(error));
			}
			dataproduk.foto = request.file.filename;
		}
		produkModel
			.update(dataproduk, { where: { id: id } })
			.then((result) => {
				return response.json({
					success: true,
					message: "product has been updated",
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

exports.deleteProduct = async (request, response) => {
	const id = request.params.id;
	const fotodata = await produkModel.findOne({ where: { id: id } });
	const oldPhoto = fotodata.gambar_barang;
	const pathPhoto = path.join(__dirname, `../fotoproduk`, oldPhoto);
	if (fs.existsSync(pathPhoto)) {
		fs.unlink(pathPhoto, (error) => console.log(error));
	}
	produkModel
		.destroy({ where: { id: id } })
		.then((result) => {
			return response.json({
				success: true,
				message: "product has been deleted",
			});
		})
		.catch((error) => {
			return response.json({
				success: false,
				message: error.message,
			});
		});
};
