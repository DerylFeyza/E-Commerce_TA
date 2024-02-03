"use strict";
const faker = require("faker");
const bcrypt = require("bcrypt");
/** @type {import('sequelize-cli').Migration} */
const enumValues = ["customer", "seller", "admin"];
module.exports = {
	async up(queryInterface, Sequelize) {
		const data = [];
		for (let i = 0; i < 30; i++) {
			const randomDate = faker.date.between(
				new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
				new Date()
			);
			const randomEnumValue = faker.random.arrayElement(enumValues);
			data.push({
				username: faker.name.findName(),
				email: faker.internet.email(),
				role: randomEnumValue,
				password: await bcrypt.hash("123", 10),
				createdAt: randomDate,
			});
		}

		await queryInterface.bulkInsert("users", data, {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("users", null, {});
	},
};
