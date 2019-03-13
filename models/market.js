module.exports = (sequelize, DataTypes) => {
  const Market = sequelize.define(
    "market",
    {
      name: {
        type: DataTypes.STRING
      },
      PhoneNumber: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.STRING
      },
      GeoLocation: {
        type: DataTypes.JSON
      },
      OpeningTimes: {
        type: DataTypes.JSON
      }
    },
    {
      timestamps: true,
      paranoid: true,
      updatedAt: false
    }
  );
  Market.associate = function(models) {
    Market.belongsToMany(models.offer, {
      through: 'MarketOffers',
      unique: false,
      constraints: false
    });
  };
  return Market;
};
