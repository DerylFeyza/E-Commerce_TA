const cartModel = require("../models/index").keranjanguser;
const cartDetailsModel = require("../models/index").detailkeranjang;
const userModel = require("../models/index").user;
const produkModel = require("../models/index").produk;

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

exports.getCartOnDraft = async (request, response) => {
	try {
		const userCart = await cartModel.findOne({
			where: { status: "draft", id_user: request.userData.id_user },
		});
		if (!userCart) {
			return response.json({
				success: false,
				message: "user have not made an order",
			});
		}

		const userCartDetails = await cartDetailsModel.findAll({
			where: { id_keranjang: userCart.id },
		});

		const products = await this.getProductDetailsForCart(userCartDetails);

		return response.json({
			success: true,
			cart: userCart,
			data: userCartDetails,
			products,
			message: "cart has been successfully fetched",
		});
	} catch (error) {
		console.error("Error fetching cart", error);
		return response.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.getUserReceipt = async (request, response) => {
	const iduser = request.userData.id_user;
	const idTransaksi = request.params.id;
	try {
		const keranjang = await cartModel.findOne({
			where: { id: idTransaksi, status: "dibayar", id_user: iduser },
		});

		if (!keranjang) {
			return response.status(401).json({
				success: false,
				message: `Transaction Not Found`,
			});
		}

		const keranjangDetails = await cartDetailsModel.findAll({
			where: { id_keranjang: idTransaksi },
		});

		const details = await this.getProductDetailsForCart(keranjangDetails);

		return response.json({
			success: true,
			data: keranjang,
			details,
			message: "Payment Receipt has been successfully loaded",
		});
	} catch (error) {
		return response.status(401).json({
			success: false,
			message: `Something went wrong`,
		});
	}
};

exports.getTransactionHistory = async (request, response) => {
	try {
		const userCart = await cartModel.findAll({
			attributes: ["id", "totalharga", "updatedAt"],
			where: { status: "dibayar", id_user: request.userData.id_user },
		});

		if (!userCart) {
			return response.json({
				success: false,
				message: "user have not made a transaction",
			});
		}

		return response.json({
			success: true,
			data: userCart,
			message: "Transaction History has been successfully fetched",
		});
	} catch (error) {
		console.error("Error fetching cart", error);
		return response.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
