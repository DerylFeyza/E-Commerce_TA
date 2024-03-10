const produkModel = require("../models/index").produk;
const cartModel = require("../models/index").keranjanguser;
const cartDetailsModel = require("../models/index").detailkeranjang;

exports.productToCart = async (request, response) => {
	try {
		let cartData = {
			id_user: request.userData.id_user,
			status: "draft",
		};
		const checkExistingCart = await cartModel.findOne({
			where: { id_user: cartData.id_user, status: "draft" },
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
		await this.recalculateTotalPrice(response, request.userData.id_user);
		return response.json({
			success: true,
			message: "New cart created and product has been added to the cart",
		});
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

exports.recalculateTotalPrice = async (response, id_user) => {
	try {
		const userCart = await cartModel.findOne({
			where: { status: "draft", id_user: id_user },
		});

		const id_keranjang = userCart.id;
		if (!id_keranjang) {
			return response.json({
				success: false,
				data: cartData,
				message: "keranjang not found, go shop",
			});
		}

		totalharga = await cartDetailsModel.sum("total", {
			where: { id_keranjang: id_keranjang },
		});

		await cartModel.update(
			{ totalharga: totalharga },
			{ where: { id: id_keranjang } }
		);
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

exports.removeProductFromCart = async (request, response) => {
	const id = request.params.id;
	try {
		const userCart = await cartModel.findOne({
			where: { status: "draft", id_user: request.userData.id_user },
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
		await this.recalculateTotalPrice(response, request.userData.id_user);
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
	try {
		const iduser = request.userData.id_user;
		await cartModel.update(
			{ status: "dibayar" },
			{
				where: { id_user: iduser, status: "draft" },
			}
		);
		return response.json({
			success: true,
			message: "checkout berhasil",
		});
	} catch (error) {
		return response.status(401).json({
			success: false,
			user: request.userData.id_user,
			message: `Unauthorized: ${error.message}`,
		});
	}
};
