'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class produk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  produk.init({
    nama_barang: DataTypes.STRING,
    gambar_barang: DataTypes.STRING,
    kategori: DataTypes.STRING,
    harga: DataTypes.INTEGER,
    stok: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'produk',
  });
  return produk;
};