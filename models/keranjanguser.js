"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class keranjanguser extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.user, {
				foreignKey: "id_user",
			});
		}
	}
	keranjanguser.init(
		{
			id_user: DataTypes.INTEGER,
			totalharga: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "keranjanguser",
		}
	);
	return keranjanguser;
};
