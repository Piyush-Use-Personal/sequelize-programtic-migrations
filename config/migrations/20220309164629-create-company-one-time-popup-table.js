"use strict";

const TABLE_NAME = 'company_one_time_popup'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(TABLE_NAME, {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      CompanyId: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      ModalName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      Shown:{
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 0
      },
      CreatedOn: {
        type: Sequelize.DATE, 
        defaultValue: Sequelize.fn('NOW')
      },
      UpdatedOn: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      DeletedOn: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.dropTable(TABLE_NAME);
  },
};