const alamatModel = require("../models/index").alamat;
const Op = require("sequelize").Op;

exports.getAlamatFromId = async (id) => {
	try {
		const data = await alamatModel.findByPk(id);
		return data;
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

exports.addAddress = async (request, response) => {
	const userID = request.userData.id_user;
	try {
		const newAddress = {
			nama: request.body.nama,
			id_user: userID,
			kota: request.body.kota,
			alamat: request.body.alamat,
		};

		const checkDuplicate = await alamatModel.findAll({
			where: {
				id_user: userID,
				[Op.or]: [{ nama: newAddress.nama }, { alamat: newAddress.alamat }],
			},
		});

		if (checkDuplicate.length > 0) {
			return response.json({
				success: false,
				message: "duplicate input",
				duplicate: checkDuplicate,
			});
		}

		const result = await alamatModel.create(newAddress);
		return response.json({
			success: true,
			data: result,
			message: "new address added successfully",
		});
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

exports.getUserAddress = async (request, response) => {
	const userID = request.userData.id_user;
	try {
		const result = await alamatModel.findAll({
			where: {
				id_user: userID,
			},
		});
		return response.json({
			success: true,
			data: result,
			user: userID,
			message: "user address has been loaded",
		});
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateAddress = async (request, response) => {
	let id = request.params.id;
	try {
		const isOwner = await alamatModel.findOne({
			where: { id_user: request.userData.id_user },
		});
		if (!isOwner) {
			return response.status(400).json({
				success: false,
				message: "Unauthorized",
			});
		}
		let AddressData = {
			nama: request.body.nama,
			kota: request.body.kota,
			alamat: request.body.alamat,
		};
		await alamatModel.update(AddressData, { where: { id: id } });
		return response.json({
			success: true,
			message: "address has been updated",
		});
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};

exports.deleteAddress = async (request, response) => {
	try {
		const isOwner = await alamatModel.findOne({
			where: { id_user: request.userData.id_user },
		});
		if (!isOwner) {
			return response.status(400).json({
				success: false,
				message: "Unauthorized",
			});
		}
		await alamatModel.destroy({ where: { id: id } });
		return response.json({
			success: true,
			message: "address has been deleted",
		});
	} catch (err) {
		return response.json({
			success: false,
			message: err.message,
		});
	}
};
