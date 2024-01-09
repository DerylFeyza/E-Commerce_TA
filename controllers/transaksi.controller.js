const produkModel = require("../models/index").produk;
const cartModel = require("../models/index").keranjanguser;
const cartDetailsModel = require("../models/index").keranjangitems;
const Op = require("sequelize").Op;

exports.productToCart = async (request, response) => {
	try {
		let cartData = {
			id_user: request.body.id_user,
			status: "draft",
		};
		let totalharga = 0;
		const iduser = cartData.id_user;
		const checkExistingCart = await cartModel.findOne({
			where: { id_user: iduser, status: "draft" },
		});

		if (checkExistingCart) {
			const id_keranjang = checkExistingCart.id;
			await cartDetailsModel.destroy({ where: { id_keranjang: id_keranjang } });

			let detailsoforder = request.body.detailsoforder;
			for (let i = 0; i < detailsoforder.length; i++) {
				const productData = await produkModel.findOne({
					where: { id: detailsoforder[i].id_produk },
				});

				detailsoforder[i].total =
					detailsoforder[i].quantity * productData.harga;

				detailsoforder[i].id_keranjang = id_keranjang;
				totalharga += detailsoforder[i].total;
			}

			await cartModel.update(
				{ totalharga: totalharga },
				{
					where: { id_user: iduser, status: "draft" },
				}
			);

			await cartDetailsModel.bulkCreate(detailsoforder);

			return response.json({
				success: true,
				message: "cart has been updated successfully",
			});
		} else {
			const result = await cartModel.create(cartData);
			let id_keranjang = result.id;
			let detailsoforder = request.body.detailsoforder;

			for (let i = 0; i < detailsoforder.length; i++) {
				const productData = await produkModel.findOne({
					where: { id: detailsoforder[i].id_produk },
				});

				detailsoforder[i].total =
					detailsoforder[i].quantity * productData.harga;

				detailsoforder[i].id_keranjang = id_keranjang;
				totalharga += detailsoforder[i].total;
			}

			await cartModel.update(
				{ totalharga: totalharga },
				{
					where: { id_user: iduser, status: "draft" },
				}
			);

			await cartDetailsModel.bulkCreate(detailsoforder);
			return response.json({
				message: iduser,
				success: true,
				message: "new cart and product have been inserted into the cart",
			});
		}
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

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
