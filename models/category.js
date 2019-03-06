module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "category",
    {
      name: {
        type: DataTypes.STRING
      },
      unit: {
        type: DataTypes.STRING
      },
      PictureId: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true,
      paranoid: true,
      updatedAt: false
    }
  );
  Category.associate = function(models) {
    Category.belongsToMany(models.offer, {
      through: 'OfferCategories'
    });
  };
  return Category;
};
