const produkModel = require("../models/index").produk;
const cartModel = require("../models/index").keranjanguser;
const cartDetailsModel = require("../models/index").detailkeranjang;
const Op = require("sequelize").Op;

exports.productToCart = async (request, response) => {
	try {
		let cartData = {
			id_user: request.userData.id_user,
			status: "draft",
		};
		let totalharga = 0;
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

			totalharga = await cartDetailsModel.sum("total", {
				where: { id_keranjang: id_keranjang },
			});

			await cartModel.update(
				{ totalharga: totalharga },
				{ where: { id: id_keranjang } }
			);

			return response.json({
				success: true,
				message: "Product added to the cart successfully",
			});
		} else {
			// Create new cart and add product
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

			totalharga += detailsoforder.total;

			await cartDetailsModel.create(detailsoforder);

			await cartModel.update(
				{ totalharga: totalharga },
				{ where: { id: id_keranjang } }
			);

			return response.json({
				success: true,
				message: "New cart created and product has been added to the cart",
			});
		}
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

//who let me cook
// exports.productToCart = async (request, response) => {
// 	try {
// 		let cartData = {
// 			id_user: request.userData.id_user,
// 			status: "draft",
// 		};
// 		let totalharga = 0;
// 		const checkExistingCart = await cartModel.findOne({
// 			where: { id_user: cartData.id_user, status: "draft" },
// 		});

// 		if (checkExistingCart) {
// 			const id_keranjang = checkExistingCart.id;
// 			await cartDetailsModel.destroy({ where: { id_keranjang: id_keranjang } });

// 			let detailsoforder = request.body.detailsoforder;
// 			for (let i = 0; i < detailsoforder.length; i++) {
// 				const productData = await produkModel.findOne({
// 					where: { id: detailsoforder[i].id_produk },
// 				});

// 				detailsoforder[i].total =
// 					detailsoforder[i].quantity * productData.harga;

// 				detailsoforder[i].id_keranjang = id_keranjang;
// 				totalharga += detailsoforder[i].total;
// 			}

// 			await cartModel.update(
// 				{ totalharga: totalharga },
// 				{
// 					where: { id_user: cartData.id_user, status: "draft" },
// 				}
// 			);

// 			await cartDetailsModel.bulkCreate(detailsoforder);

// 			return response.json({
// 				success: true,
// 				message: "cart has been updated successfully",
// 			});
// 		} else {
// 			const result = await cartModel.create(cartData);
// 			let id_keranjang = result.id;
// 			let detailsoforder = request.body.detailsoforder;

// 			for (let i = 0; i < detailsoforder.length; i++) {
// 				const productData = await produkModel.findOne({
// 					where: { id: detailsoforder[i].id_produk },
// 				});

// 				detailsoforder[i].total =
// 					detailsoforder[i].quantity * productData.harga;

// 				detailsoforder[i].id_keranjang = id_keranjang;
// 				totalharga += detailsoforder[i].total;
// 			}

// 			await cartModel.update(
// 				{ totalharga: totalharga },
// 				{
// 					where: { id_user: cartData.id_user, status: "draft" },
// 				}
// 			);

// 			await cartDetailsModel.bulkCreate(detailsoforder);
// 			return response.json({
// 				message: cartData.id_user,
// 				success: true,
// 				message: "new cart and product have been inserted into the cart",
// 			});
// 		}
// 	} catch (error) {
// 		return response.json({
// 			success: false,
// 			message: error.message,
// 		});
// 	}
// };

exports.checkout = async (req, res) => {
	try {
		const iduser = req.userData.id_user;
		console.log(iduser);
		cartModel
			.update(
				{ status: "dibayar" },
				{
					where: { id_user: iduser, status: "draft" },
				}
			)
			.then((result) => {
				return res.json({
					success: true,
					message: "checkout berhasil",
				});
			})
			.catch((error) => {
				return res.json({
					success: false,
					message: error.message,
				});
			});
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: `Unauthorized: ${error.message}`,
		});
	}
};
