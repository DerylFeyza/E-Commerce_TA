const cartModel = require("../models/index").keranjanguser;
const cartDetailsModel = require("../models/index").detailkeranjang;
const userModel = require("../models/index").user;
const { getProductDetailsForCart } = require("./cart.controller");

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

		const userData = await userModel.findByPk(iduser, {
			attributes: ["username"],
		});

		const details = await getProductDetailsForCart(keranjangDetails);

		return response.json({
			success: true,
			userData: userData,
			cartInfo: keranjang,
			data: keranjangDetails,
			products: details,
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

exports.userDeleteOwnReceipt = async (request, response) => {
	const iduser = request.userData.id_user;
	const idTransaksi = request.params.id;
	try {
		const wawa = await cartDetailsModel.destroy({
			where: { id_keranjang: idTransaksi },
		});

		if (!wawa) {
			return response.status(400).json({
				success: false,
				message: "Transaction doesn't exist",
			});
		}

		await cartModel.destroy({
			where: { id: idTransaksi, id_user: iduser, status: "dibayar" },
		});

		return response.json({
			success: true,
			message: "Transaction History has been successfully deleted",
		});
	} catch (error) {
		return response.status(500).json({
			success: false,
			message: "Delete unsuccessful",
		});
	}
};
