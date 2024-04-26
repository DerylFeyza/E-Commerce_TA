"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class detailreceipt extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	detailreceipt.init(
		{
			id_receipt: DataTypes.INTEGER,
			id_seller: DataTypes.INTEGER,
			namaproduk: DataTypes.STRING,
			hargaproduk: DataTypes.INTEGER,
			quantity: DataTypes.INTEGER,
			total: DataTypes.INTEGER,
			fromcity: DataTypes.STRING,
			fromaddress: DataTypes.STRING,
			tocity: DataTypes.STRING,
			toaddress: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "detailreceipt",
		}
	);
	return detailreceipt;
};
