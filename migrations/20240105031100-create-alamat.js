"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("alamats", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			nama: {
				type: Sequelize.STRING,
			},
			id_user: {
				type: Sequelize.INTEGER,
				references: {
					model: "users",
					key: "id",
				},
			},
			kota: {
				type: Sequelize.STRING,
			},
			alamat: {
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
		await queryInterface.dropTable("alamats");
	},
};
