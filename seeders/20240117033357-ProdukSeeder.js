"use strict";
const faker = require("faker");
const md5 = require("md5");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const data = [];
		for (let i = 0; i < 20; i++) {
			const randomProductName = faker.commerce.productName();
			const randomPrice = faker.datatype.number({ min: 10, max: 200 });
			const randomStock = faker.datatype.number({ min: 1, max: 100 });

			data.push({
				nama_barang: randomProductName,
				gambar_barang: "foto-1704546917091",
				kategori: "miaw",
				harga: randomPrice,
				stok: randomStock,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		await queryInterface.bulkInsert("produks", data, {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("produks", null, {});
	},
};
