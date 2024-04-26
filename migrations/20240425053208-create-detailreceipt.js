"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("detailreceipts", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			id_receipt: {
				type: Sequelize.INTEGER,
				references: {
					model: "receipts",
					key: "id",
				},
			},
			id_seller: {
				type: Sequelize.INTEGER,
				references: {
					model: "users",
					key: "id",
				},
			},
			namaproduk: {
				type: Sequelize.STRING,
			},
			hargaproduk: {
				type: Sequelize.INTEGER,
			},
			quantity: {
				type: Sequelize.INTEGER,
			},
			total: {
				type: Sequelize.INTEGER,
			},
			fromcity: {
				type: Sequelize.STRING,
			},
			fromaddress: {
				type: Sequelize.STRING,
			},
			tocity: {
				type: Sequelize.STRING,
			},
			toaddress: {
				type: Sequelize.STRING,
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
		await queryInterface.dropTable("detailreceipts");
	},
};
