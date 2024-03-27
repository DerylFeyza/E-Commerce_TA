"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("produks", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			id_publisher: {
				type: Sequelize.INTEGER,
				references: {
					model: "users",
					key: "id",
				},
			},
			nama_barang: {
				type: Sequelize.STRING,
			},
			gambar_barang: {
				type: Sequelize.STRING,
			},
			kategori: {
				type: Sequelize.STRING,
			},
			id_alamat: {
				type: Sequelize.INTEGER,
				references: {
					model: "alamats",
					key: "id",
				},
			},
			harga: {
				type: Sequelize.INTEGER,
			},
			stok: {
				type: Sequelize.INTEGER,
			},
			details: {
				type: Sequelize.TEXT,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("produks");
	},
};
