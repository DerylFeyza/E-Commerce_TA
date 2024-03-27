"use strict";
const faker = require("faker");
const { QueryTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const data = [];
		const userIDs = await queryInterface.sequelize.query(
			"SELECT id FROM users",
			{ type: QueryTypes.SELECT }
		);
		for (let i = 0; i < 10; i++) {
			const randomUserID =
				userIDs[Math.floor(Math.random() * userIDs.length)].id;
			const randomDate = faker.date.recent();
			data.push({
				nama: "hehe",
				id_user: randomUserID,
				kota: faker.address.city(),
				alamat: faker.address.streetAddress(),
				createdAt: randomDate,
			});
		}

		await queryInterface.bulkInsert("alamats", data, {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("alamats", null, {});
	},
};
