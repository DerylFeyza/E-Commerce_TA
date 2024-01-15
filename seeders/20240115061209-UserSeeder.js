"use strict";
const faker = require("faker");
const md5 = require("md5");
/** @type {import('sequelize-cli').Migration} */
const enumValues = ["customer", "seller", "admin"];
module.exports = {
	async up(queryInterface, Sequelize) {
		const data = [];
		for (let i = 0; i < 30; i++) {
			const randomDate = faker.date.between(
				new Date(new Date().setFullYear(new Date().getFullYear() - 10)), // 10 years ago
				new Date() // Today
			);
			const randomEnumValue = faker.random.arrayElement(enumValues);
			data.push({
				username: faker.name.findName(),
				email: faker.internet.email(),
				role: randomEnumValue,
				password: md5(123),
				createdAt: randomDate,
				updatedAt: randomDate,
			});
		}

		await queryInterface.bulkInsert("users", data, {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("users", null, {});
	},
};
