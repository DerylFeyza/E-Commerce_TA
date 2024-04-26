"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class receipt extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	receipt.init(
		{
			id_buyer: DataTypes.INTEGER,
			totalharga: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "receipt",
		}
	);
	return receipt;
};
