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
        type: DataTypes.STRING
      },
      OpeningTimes: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true,
      paranoid: true,
      updatedAt: false
    }
  );
  Market.associate = function(models) {
    Market.hasMany(models.offer);
  };
  return Market;
};
