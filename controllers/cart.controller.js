const produkModel = require("../models/index").produk;
const cartModel = require("../models/index").keranjanguser;
const cartDetailsModel = require("../models/index").detailkeranjang;
const Op = require("sequelize").Op;

exports.getCartOnDraft = async (request, response) => {
	try {
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
