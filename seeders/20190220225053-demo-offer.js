'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */

    return await queryInterface.bulkInsert('Offers', [{
      id: 1,
      name: "Wiltmann Salami",
      pic_url: "https://img.rewe-static.de/REWE04_2019/4241002/22972349-13_digital-image.png?resize=200px:200px",
      price: "0,99",
      information: ["versch. Sorten,", "(100 g = 1.24)", "je 80-g-Pckg."],
      unit: "gram",
      volume: '80',
      dueDate: '27.01.2019',
      created_at: '27.01.2019'
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('Offers', null, {});
  }
};
