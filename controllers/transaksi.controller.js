const produkModel = require("../models/index").produk;
const cartModel = require("../models/index").keranjanguser;
const cartDetailsModel = require("../models/index").detailkeranjang;
const userModel = require("../models/index").user;
const receiptModel = require("../models/index").receipt;
const receiptDetailsModel = require("../models/index").detailreceipt;

exports.productToCart = async (request, response) => {
	try {
		const isPublisher = await produkModel.findOne({
			where: {
				id_publisher: request.userData.id_user,
				id: request.body.id_produk,
			},
		});

		if (isPublisher) {
			return response.json({
				success: false,
				status: "Publisher",
				message: "You cant buy you own products",
			});
		}

		let cartData = {
			id_user: request.userData.id_user,
		};

		const checkExistingCart = await cartModel.findOne({
			where: { id_user: cartData.id_user },
		});

		const productData = await produkModel.findOne({
			where: { id: request.body.id_produk },
		});

		if (checkExistingCart) {
			const id_keranjang = checkExistingCart.id;

			const existingCartItem = await cartDetailsModel.findOne({
				where: {
					id_keranjang: id_keranjang,
					id_produk: request.body.id_produk,
				},
			});

			if (existingCartItem) {
				const updatedTotal = request.body.quantity * productData.harga;

				await cartDetailsModel.update(
					{
						quantity: request.body.quantity,
						total: updatedTotal,
					},
					{
						where: {
							id_keranjang: id_keranjang,
							id_produk: request.body.id_produk,
						},
					}
				);
			} else {
				const detailsoforder = {
					id_produk: request.body.id_produk,
					quantity: request.body.quantity,
					total: request.body.quantity * productData.harga,
					id_keranjang: id_keranjang,
				};

				await cartDetailsModel.create(detailsoforder);
			}
		} else {
			const result = await cartModel.create(cartData);
			const id_keranjang = result.id;

			const productData = await produkModel.findOne({
				where: { id: request.body.id_produk },
			});

			const detailsoforder = {
				id_produk: request.body.id_produk,
				quantity: request.body.quantity,
				total: request.body.quantity * productData.harga,
				id_keranjang: id_keranjang,
			};
			await cartDetailsModel.create(detailsoforder);
		}
		await this.recalculateTotalPrice(request.userData.id_user);
		return response.json({
			success: true,
			message: "product has been added to the cart",
		});
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

exports.recalculateTotalPrice = async (id_user) => {
	const userCart = await cartModel.findOne({
		where: { id_user: id_user },
	});

	const id_keranjang = userCart.id;
	if (!id_keranjang) {
		return response.json({
			success: false,
			data: cartData,
			message: "keranjang not found, go shop",
		});
	}

	const totalharga = await cartDetailsModel.sum("total", {
		where: { id_keranjang: id_keranjang },
	});

	await cartModel.update(
		{ totalharga: totalharga },
		{ where: { id: id_keranjang } }
	);
};

exports.removeProductFromCart = async (request, response) => {
	const id = request.params.id;
	try {
		const userCart = await cartModel.findOne({
			where: { id_user: request.userData.id_user },
		});

		const isDeleted = await cartDetailsModel.destroy({
			where: { id_produk: id, id_keranjang: userCart.id },
		});

		if (!isDeleted) {
			return response.json({
				success: false,
				message: "No Product Found",
			});
		}
		await this.recalculateTotalPrice(request.userData.id_user);
		return response.json({
			success: true,
			message: "Product Has Been Deleted from Cart",
		});
	} catch (error) {
		console.error("Error deleting product", error);
		return response.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.checkout = async (request, response) => {
	const iduser = request.userData.id_user;
	try {
		const user = await userModel.findByPk(iduser);
		const cartUser = await cartModel.findOne({
			where: { id_user: iduser },
		});

		const idCart = cartUser.id;

		if (!cartUser) {
			return response.json({
				success: false,
				message: "cart not found",
			});
		}

		const updatedUserSaldo = user.saldo - cartUser.totalharga;
		if (updatedUserSaldo < 0) {
			return response.json({
				success: false,
				status: "Insufficient Balance",
			});
		}

		const allProductOnCart = await cartDetailsModel.findAll({
			where: { id_keranjang: idCart },
		});

		let insufficientStockProducts = [];
		let receiptDetails = [];

		await Promise.all(
			allProductOnCart.map(async (cartProduct) => {
				const existingProduct = await produkModel.findByPk(
					cartProduct.id_produk
				);

				const productSeller = await userModel.findByPk(
					existingProduct.id_publisher
				);

				const receiptDetailData = {
					id_seller: existingProduct.id_publisher,
					namaproduk: existingProduct.nama_barang,
					hargaproduk: existingProduct.harga,
					quantity: cartProduct.quantity,
					total: cartProduct.total,
				};

				const newStock = existingProduct.stok - cartProduct.quantity;
				if (newStock < 0 || existingProduct.status !== "OnSale") {
					insufficientStockProducts.push(cartProduct);
				} else if (newStock == 0) {
					await produkModel.update(
						{ stok: newStock, status: "SoldOut" },
						{ where: { id: cartProduct.id_produk } }
					);
					receiptDetails.push(receiptDetailData);
					await userModel.update(
						{
							saldo: productSeller.saldo + cartProduct.total,
						},
						{ where: { id: existingProduct.id_publisher } }
					);
				} else {
					await produkModel.update(
						{ stok: newStock },
						{ where: { id: cartProduct.id_produk } }
					);
					receiptDetails.push(receiptDetailData);
					await userModel.update(
						{
							saldo: productSeller.saldo + cartProduct.total,
						},
						{ where: { id: existingProduct.id_publisher } }
					);
				}
			})
		);

		if (insufficientStockProducts.length > 0) {
			await Promise.all(
				insufficientStockProducts.map(async (InvalidProducts) => {
					await cartDetailsModel.destroy({
						where: { id_keranjang: idCart, id: InvalidProducts.id },
					});
				})
			);

			await this.recalculateTotalPrice(iduser);
			return response.json({
				success: false,
				status: "Product Error",
				message:
					"Insufficient Stock, The product with insufficient stock has been removed",
				insufficientStockProducts: insufficientStockProducts,
			});
		}

		await userModel.update(
			{ saldo: updatedUserSaldo },
			{ where: { id: iduser } }
		);

		const newReceipt = {
			id_buyer: iduser,
			totalharga: cartUser.totalharga,
			fromcity: request.body.fromcity,
			fromaddress: request.body.fromaddress,
			tocity: request.body.tocity,
			toaddress: request.body.toaddress,
		};

		const receiptResult = await receiptModel.create(newReceipt);

		const id_receipt = receiptResult.id;

		for (let i = 0; i < receiptDetails.length; i++) {
			receiptDetails[i].id_receipt = id_receipt;
		}

		await receiptDetailsModel.bulkCreate(receiptDetails);

		await cartDetailsModel.destroy({ where: { id_keranjang: idCart } });
		await cartModel.destroy({ where: { id_user: iduser } });

		return response.json({
			success: true,
			data: cartUser.id,
			message: "checkout berhasil",
		});
	} catch (error) {
		return response.json({
			success: false,
			message: `Unauthorized: ${error.message}`,
		});
	}
};
