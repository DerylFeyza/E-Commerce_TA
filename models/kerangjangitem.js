'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kerangjangitem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  kerangjangitem.init({
    id_keranjang: DataTypes.INTEGER,
    id_produk: DataTypes.INTEGER,
    quantity_produk: DataTypes.INTEGER,
    harga_quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'kerangjangitem',
  });
  return kerangjangitem;
};