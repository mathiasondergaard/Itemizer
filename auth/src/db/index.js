const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.AUTH_DB_DB, process.env.AUTH_DB_USER, process.env.AUTH_DB_PW, {
    host: process.env.AUTH_DB_HOST,
    port: process.env.AUTH_DB_PORT,
    dialect: process.env.AUTH_DB_DIALECT,
    dialectOptions:{useUTC:false},
    timezone:"+02:00",
    operatorsAliases: 0,
    define: {
        timestamps: false
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false,
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;