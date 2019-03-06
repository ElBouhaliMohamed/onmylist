'use strict';
module.exports = (sequelize, DataTypes) => {
  var Offer = sequelize.define('offer', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: true
      },
      price: {
        type: DataTypes.STRING,
        allowNull: false
      },
      information: {
        type: DataTypes.JSON,
        allowNull: false
      },
      pic_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      volume: {
        type: DataTypes.STRING,
        allowNull: true
      }
  }, {
    timestamps: true,
    paranoid: true,
    updatedAt: false,
    deletedAt: 'dueDate'
  });

  Offer.associate = function(models) {
    Offer.belongsTo(models.market);

    Offer.belongsToMany(models.category, {
      through: 'OfferCategories'
    });
  };
  return Offer;
};