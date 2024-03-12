const cartModel = require("../models/index").keranjanguser;
const cartDetailsModel = require("../models/index").detailkeranjang;
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
