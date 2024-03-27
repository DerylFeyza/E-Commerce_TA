"use strict";
const faker = require("faker");
const { QueryTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const data = [];

		const userIDs = await queryInterface.sequelize.query(
			"SELECT id FROM users WHERE role = 'seller' OR role = 'admin'",
			{ type: QueryTypes.SELECT }
		);

		for (let i = 0; i < 100; i++) {
			const randomProductName = faker.commerce.productName();
			const randomPrice = faker.datatype.number({ min: 10, max: 200 });
			const randomStock = faker.datatype.number({ min: 1, max: 100 });

			const randomUserID =
				userIDs[Math.floor(Math.random() * userIDs.length)].id;

			data.push({
				nama_barang: randomProductName,
				id_publisher: randomUserID,
				gambar_barang: "foto-1704546917091.png",
				kategori: "miaw",
				id_alamat: 1,
				harga: randomPrice,
				stok: randomStock,
				details:
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",

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
