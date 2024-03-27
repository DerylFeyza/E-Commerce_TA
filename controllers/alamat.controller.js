const alamatModel = require("../models/index").alamat;

exports.addAddress = async (request, response) => {
	try {
		const newAddress = {
			nama: request.body.nama,
			id_user: request.userData.id_user,
			kota: request.body.kota,
			alamat: request.body.alamat,
		};
		await alamatModel.create(newAddress);
		return response.json({
			success: true,
			data: result,
			message: "new user success",
		});
	} catch (error) {
		return response.json({
			success: false,
			message: error.message,
		});
	}
};
