const receiptModel = require("../models/index").receipt;
const receiptDetailsModel = require("../models/index").detailreceipt;
const userModel = require("../models/index").user;

exports.getUserReceipt = async (request, response) => {
	const iduser = request.userData.id_user;
	const idReceipt = request.params.id;
	try {
		const receipt = await receiptModel.findOne({
			where: { id: idReceipt, id_buyer: iduser },
		});

		if (!receipt) {
			return response.status(401).json({
				success: false,
				message: `Transaction Not Found`,
			});
		}

		const receiptDetails = await receiptDetailsModel.findAll({
			where: { id_receipt: idReceipt },
		});

		const userData = await userModel.findByPk(iduser, {
			attributes: ["username"],
		});

		return response.json({
			success: true,
			userData: userData,
			receipt: receipt,
			data: receiptDetails,
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
		const userPurchaseHistory = await receiptModel.findAll({
			attributes: ["id", "totalharga", "createdAt"],
			where: { id_buyer: request.userData.id_user },
			order: [["createdAt", "DESC"]],
		});

		if (!userPurchaseHistory) {
			return response.json({
				success: false,
				message: "user have not made a transaction",
			});
		}

		return response.json({
			success: true,
			data: userPurchaseHistory,
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

exports.getRecentPurchase = async (request, response) => {
	const iduser = request.userData.id_user;

	try {
		const recentPurchases = await receiptDetailsModel.findAll({
			attributes: ["namaproduk", "hargaproduk", "quantity", "total"],
			where: {
				id_seller: iduser,
			},
			order: [["createdAt", "DESC"]],
			limit: 6,
		});

		if (recentPurchases.length == 0) {
			return response.json({
				success: false,
				message: "no recent purchase",
			});
		}
		return response.json({
			success: true,
			message: "Recent sales have been loaded",
			purchases: recentPurchases,
		});
	} catch (error) {
		return response.json({
			success: false,
			message: "Internal server error",
		});
	}
};
