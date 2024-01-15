"use strict";
const faker = require("faker");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const data = [];

		for (let i = 0; i < 10; i++) {
			data.push({
				// Add your model attributes and use faker to generate random data
				name: faker.name.findName(),
				email: faker.internet.email(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		await queryInterface.bulkInsert("YourModelName", data, {});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
	},
};
