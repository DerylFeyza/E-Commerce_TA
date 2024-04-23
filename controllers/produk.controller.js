const produkModel = require("../models/index").produk;
const Op = require("sequelize").Op;
const upload = require("./upload-foto").single("gambar_barang");
const cartDetailsModel = require("../models/index").detailkeranjang;
const { getAlamatFromId } = require("./alamat.controller");
const { getUserById } = require("./user.controller");
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

exports.checkProductOwnership = async (userId, productId) => {
	try {
		const product = await produkModel.findOne({
			where: { id_publisher: userId, id: productId },
		});
		return !!product;
	} catch (error) {
		throw error;
	}
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
			limit: 6,
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
		const limit =
			parseInt(request.query.limit) || parseInt(request.body.limit) || 20;
		const startIndex = (page - 1) * limit;

		const totalProducts = await produkModel.count();
		const totalPages = Math.ceil(totalProducts / limit);

		let products = await produkModel.findAll({
			where: { status: "OnSale" },
			attributes: { exclude: ["details"] },
			offset: startIndex,
			limit: limit,
		});

		products = await Promise.all(
			products.map(async (product) => {
				const namaToko = await getUserById(product.id_publisher);
				const kota = await getAlamatFromId(product.id_alamat);
				return {
					...product.toJSON(),
					additional_info: [
						{
							nama_toko: namaToko.nama_toko,
							kota: kota.kota,
						},
					],
				};
			})
		);

		return response.json({
			success: true,
			data: products,
			pagination: {
				totalProducts: totalProducts,
				totalPages: totalPages,
				currentPage: page,
				productsPerPage: limit,
			},
			message: "Products loaded successfully",
		});
	} catch (err) {
		console.log(err);
		return response.sendStatus(500);
	}
};

exports.getCheapestProduct = async (request, response) => {
	try {
		const page = parseInt(request.query.page) || 1;
		const limit = 15;
		const startIndex = (page - 1) * limit;

		let products = await produkModel.findAll({
			where: { status: "OnSale" },
			attributes: { exclude: ["details"] },
			offset: startIndex,
			limit: limit,
			order: [["harga", "ASC"]],
		});

		products = await Promise.all(
			products.map(async (product) => {
				const namaToko = await getUserById(product.id_publisher);
				const kota = await getAlamatFromId(product.id_alamat);
				return {
					...product.toJSON(),
					additional_info: [
						{
							nama_toko: namaToko.nama_toko,
							kota: kota.kota,
						},
					],
				};
			})
		);

		return response.json({
			success: true,
			data: products,
			message: "Products loaded successfully",
		});
	} catch (err) {
		console.log(err);
		return response.sendStatus(500);
	}
};

exports.findProduct = async (request, response) => {
	const page = parseInt(request.query.page) || 1;
	const limit =
		parseInt(request.query.limit) || parseInt(request.body.limit) || 20;
	const startIndex = (page - 1) * limit;
	let keyword = request.body.keyword;

	try {
		let product = await produkModel.findAll({
			where: {
				[Op.and]: [
					{
						[Op.or]: [
							{ nama_barang: { [Op.substring]: keyword } },
							{ kategori: { [Op.substring]: keyword } },
							{ harga: { [Op.substring]: keyword } },
						],
					},
					{ status: "OnSale" },
				],
			},
			offset: startIndex,
			limit: limit,
		});

		if (product.length == 0) {
			return response.json({
				success: false,
				status: "no product found",
			});
		}

		let allProduct = await produkModel.count({
			where: {
				[Op.or]: [
					{ nama_barang: { [Op.substring]: keyword } },
					{ kategori: { [Op.substring]: keyword } },
					{ harga: { [Op.substring]: keyword } },
				],
			},
		});

		const totalPages = Math.ceil(allProduct / limit);

		product = await Promise.all(
			product.map(async (product) => {
				const namaToko = await getUserById(product.id_publisher);
				const kota = await getAlamatFromId(product.id_alamat);
				return {
					...product.toJSON(),
					additional_info: [
						{
							nama_toko: namaToko.nama_toko,
							kota: kota.kota,
						},
					],
				};
			})
		);

		return response.json({
			success: true,
			data: product,
			pagination: {
				totalProducts: allProduct,
				totalPages: totalPages,
				currentPage: page,
				productsPerPage: limit,
			},
			message: "product with the sufficient filter has been shown",
		});
	} catch (error) {
		console.log(error);
		return response.sendStatus(500);
	}
};

exports.findProductById = async (request, response) => {
	try {
		const productId = request.params.id;
		const product = await produkModel.findOne({
			where: { id: productId, status: "OnSale" },
		});

		if (!product) {
			return response.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		const namaToko = await getUserById(product.id_publisher);
		const kota = await getAlamatFromId(product.id_alamat);

		return response.json({
			success: true,
			data: product,
			additional_info: [
				{
					nama_toko: namaToko.nama_toko,
					kota: kota.kota,
				},
			],

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

exports.RetrieveProductById = async (request, response) => {
	const productId = request.params.id;
	try {
		const product = await produkModel.findOne({
			where: { id_publisher: request.userData.id_user, id: productId },
		});
		if (!product) {
			return response.status(400).json({
				success: false,
				message: "No Product Found",
			});
		}

		return response.json({
			success: true,
			data: product,
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
				id_alamat: request.body.id_alamat,
				harga: request.body.harga,
				stok: request.body.stok,
				details: request.body.details,
				status: request.body.status,
			};

			await produkModel.create(newProduct);
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
		const id = request.params.id;
		const idUser = request.userData.id_user;
		try {
			const isOwner = await this.checkProductOwnership(idUser, id);
			if (!isOwner) {
				return response.status(400).json({
					success: false,
					message: "Unauthorized",
				});
			}

			if (error) {
				return response.json({ message: error });
			}
			const oldProduct = await produkModel.findOne({
				where: { id: id },
			});
			let dataproduk = {
				nama_barang: request.body.nama_barang
					? request.body.nama_barang
					: oldProduct.nama_barang,
				gambar_barang: request.file
					? request.file.filename
					: oldProduct.gambar_barang,
				kategori: request.body.kategori
					? request.body.kategori
					: oldProduct.kategori,
				id_alamat: request.body.id_alamat
					? request.body.id_alamat
					: oldProduct.id_alamat,
				harga: request.body.harga ? request.body.harga : oldProduct.harga,
				stok: request.body.stok ? request.body.stok : oldProduct.stok,
				details: request.body.details
					? request.body.details
					: oldProduct.details,
				status: request.body.status ? request.body.status : oldProduct.status,
			};

			if (request.file) {
				const oldPhoto = oldProduct.gambar_barang;
				const pathPhoto = path.join(__dirname, `../fotoproduk`, oldPhoto);
				if (fs.existsSync(pathPhoto)) {
					fs.unlinkSync(pathPhoto, (error) => console.log(error));
				}
				dataproduk.foto = request.file.filename;
			}

			await produkModel.update(dataproduk, { where: { id: id } });
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
	const id = request.params.id;
	const idUser = request.userData.id_user;
	try {
		const isOwner = await this.checkProductOwnership(idUser, id);
		if (!isOwner) {
			return response.status(400).json({
				success: false,
				message: "Unauthorized",
			});
		}
		const fotodata = await produkModel.findOne({ where: { id: id } });
		const oldPhoto = fotodata.gambar_barang;
		const pathPhoto = path.join(__dirname, `../fotoproduk`, oldPhoto);
		if (fs.existsSync(pathPhoto)) {
			fs.unlink(pathPhoto, (error) => console.log(error));
		}
		await produkModel.destroy({ where: { id: id } });
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

exports.restockProduct = async (request, response) => {
	const id = request.params.id;
	const idUser = request.userData.id_user;
	try {
		const product = await produkModel.findOne({
			where: { id_publisher: idUser, id: id },
		});
		if (!product) {
			return response.status(400).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const updatedStock = product.stok + parseInt(request.body.add);
		if (updatedStock > 0) {
			await produkModel.update(
				{ status: "OnSale", stok: updatedStock },
				{ where: { id: id } }
			);
			return response.json({
				success: true,
				message: "product has been restocked",
			});
		} else {
			return response.json({
				success: false,
				message: "product has not been restocked",
			});
		}
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
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
