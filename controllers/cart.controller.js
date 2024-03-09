const cartModel = require("../models/index").keranjanguser;
const cartDetailsModel = require("../models/index").detailkeranjang;
const userModel = require("../models/index").user;
const Op = require("sequelize").Op;

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

		return response.json({
			success: true,
			cart: userCart,
			data: userCartDetails,
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
