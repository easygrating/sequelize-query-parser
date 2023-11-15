"use strict";
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const db = {};

let sequelize = new Sequelize({ dialect: "sqlite" });
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require("./" + file)(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    !!db[modelName].applyHooks && db[modelName].applyHooks(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
