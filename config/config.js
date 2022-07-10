
require('dotenv').config();
module.exports = {
    development: {
        username: "root",
        password: "1234567890",
        database: "mycrew",
        host: "127.0.0.1",
        dialect: "mysql",
        query: { raw: true },
    },
    test: {
        username: "root",
        password: null, 
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql",
        query: { raw: true },
    },
    production: {
        url: process.env.DATABASE_URL,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // <<<<<< YOU NEED THIS
            }
        },
        use_env_variable:true
    },
};