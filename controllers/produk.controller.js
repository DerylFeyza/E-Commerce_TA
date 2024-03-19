const produkModel = require("../models/index").produk;
const Op = require("sequelize").Op;
const upload = require("./upload-foto").single("gambar_barang");
const cartDetailsModel = require("../models/index").detailkeranjang;
const path = require("path");
const fs = require("fs");

exports.getProductDetailsForCart = async (keranjangDetails) => {
	const details = [];
	for (const detail of keranjangDetails) {
		const productDetails = await produkModel.findOne({
			attributes: ["id", "nama_barang", "harga", "gambar_barang", "stok"],
			where: { id: detail.id_produk },
		});
		details.push(productDetails);
	}
	return details;
};

exports.getallProduct = async (request, response) => {
	let products = await produkModel.findAll();
	return response.json({
		success: true,
		data: products,
		message: "all products has been loaded",
	});
};

exports.getallMerchantProduct = async (request, response) => {
	const iduser = request.userData.id_user;
	try {
		let merchantProducts = await produkModel.findAll({
			where: { id_publisher: iduser },
		});
		return response.json({
			success: true,
			data: merchantProducts,
			message: "all products has been loaded",
		});
	} catch (error) {
		return response.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
exports.getRecentPurchase = async (request, response) => {
	const iduser = request.userData.id_user;
	try {
		let merchantProducts = await produkModel.findAll({
			where: { id_publisher: iduser },
		});
		const soldProductsIds = merchantProducts.map((product) => product.id);
		const recentPurchases = await cartDetailsModel.findAll({
			where: {
				id_produk: soldProductsIds,
				checkedout: "true",
			},
			order: [["updatedAt", "DESC"]],
		});
		if (!recentPurchases) {
			return response.json({
				success: true,
				purchase: "no recent purchase",
				message: "Recent purchases have been loaded",
			});
		}

		const soldProducts = await this.getProductDetailsForCart(recentPurchases);
		return response.json({
			success: true,
			purchases: recentPurchases,
			details: soldProducts,
			message: "Recent purchases have been loaded",
		});
	} catch (error) {
		return response.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.getAllPaginatedProducts = async (request, response) => {
	try {
		const page = parseInt(request.query.page) || 1;
		const limit = 20;

		const startIndex = (page - 1) * limit;

		const totalProducts = await produkModel.count();
		const totalPages = Math.ceil(totalProducts / limit);

		const products = await produkModel.findAll({
			attributes: { exclude: ["details"] },
			offset: startIndex,
			limit: limit,
		});

		return response.json({
			success: true,
			data: products,
			pagination: {
				totalProducts: totalProducts,
				totalPages: totalPages,
				currentPage: page,
			},
			message: "Products loaded successfully",
		});
	} catch (err) {
		console.log(err);
		return response.sendStatus(400);
	}
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

exports.findProductById = async (request, response) => {
	try {
		const productId = request.params.id;
		const product = await produkModel.findByPk(productId);

		if (!product) {
			return response.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		return response.json({
			success: true,
			data: product,
			message: "Product found",
		});
	} catch (error) {
		console.error("Error finding product by ID:", error);
		return response.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.addProduct = async (request, response) => {
	try {
		upload(request, response, async (error) => {
			if (error) {
				console.log(error);
				return response.json({ message: error });
			}
			if (!request.file) {
				return response.json({ message: "file nya dimana" });
			}

			let newProduct = {
				id_publisher: request.userData.id_user,
				nama_barang: request.body.nama_barang,
				gambar_barang: request.file.filename,
				kategori: request.body.kategori,
				harga: request.body.harga,
				stok: request.body.stok,
				details: request.body.details,
			};

			produkModel.create(newProduct);
			return response.json({
				success: true,
				message: "new product has been inserted",
			});
		});
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateProduct = async (request, response) => {
	upload(request, response, async (error) => {
		try {
			if (error) {
				return response.json({ message: error });
			}
			let id = request.params.id;
			let dataproduk = {
				id_publisher: request.userData.id_user,
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
			produkModel.update(dataproduk, { where: { id: id } });
			return response.json({
				success: true,
				message: "product has been updated",
			});
		} catch (err) {
			return response.json({
				success: false,
				message: err.message,
			});
		}
	});
};

exports.deleteProduct = async (request, response) => {
	try {
		const id = request.params.id;
		const fotodata = await produkModel.findOne({ where: { id: id } });
		const oldPhoto = fotodata.gambar_barang;
		const pathPhoto = path.join(__dirname, `../fotoproduk`, oldPhoto);
		if (fs.existsSync(pathPhoto)) {
			fs.unlink(pathPhoto, (error) => console.log(error));
		}
		produkModel.destroy({ where: { id: id } });
		return response.json({
			success: true,
			message: "product has been deleted",
		});
	} catch (err) {
		return response.json({
			success: false,
			message: err.message,
		});
	}
};

exports.getProductImage = (request, response) => {
	const filename = request.params.filename;
	const filePath = path.join(__dirname, "../fotoproduk", filename);
	response.sendFile(filePath, (err) => {
		if (err) {
			console.error(err);
			response.status(500).json({ error: "Server Error" });
		}
	});
};
