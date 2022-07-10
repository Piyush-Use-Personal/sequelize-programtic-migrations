const Sequelize = require('sequelize');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config')[env];
let db
if (config.use_env_variable) {
    db = new Sequelize(config.url, config);
} else {
    db = new Sequelize(config.database, config.username, config.password, config);
}

const getAllMigrations = async () => {
    const migrations = fs.readdirSync(__dirname + '/config/migrations');
    const dbMigrations = await db.query("SELECT * FROM `SequelizeMeta`", { 
        type: Sequelize.QueryTypes.SELECT 
    });
    const pendingMigrations = [], completedMigrations = []
    for (const migration of migrations) {
        const isExistsInDatabase = dbMigrations.find(({ name }) => name == migration)
        if (isExistsInDatabase) {
            completedMigrations.push(migration)
        }
        else {
            pendingMigrations.push(migration)
        }
    }

    return {
        migrations,
        completedMigrations,
        pendingMigrations
    }
}

const UpAllMigration = async () => {
    const { pendingMigrations } = await getAllMigrations()
    const output = []
    for (let i = 0, c = pendingMigrations.length; i < c; i++) {
        const migration = require(__dirname + '/config/migrations/' + pendingMigrations[i]);
        const result = await migration.up(db.queryInterface, Sequelize);
        output.push(result)
        await db.query("INSERT INTO `SequelizeMeta` VALUES(:name)", { 
            type: Sequelize.QueryTypes.INSERT, 
            replacements: { 
                name: pendingMigrations[i]
            }
        })
    }
    return output
}
const downAllMigration = async () => {
    const output = []
    const { completedMigrations } = await getAllMigrations()
    for (let i = 0, c = completedMigrations.length; i < c; i++) {
        const migration = require(__dirname + '/config/migrations/' + completedMigrations[i]);
        const result = await migration.down(db.queryInterface, Sequelize);
        await db.query("DELETE FROM `SequelizeMeta` WHERE name=(:name)", { 
            type: Sequelize.QueryTypes.DELETE, 
            replacements: { name: completedMigrations[i] } 
        })
        output.push(result)
    }
    return output
}
downAllMigration()

const downLatestMigration = async () => {
    const output = []
    const { completedMigrations } = await getAllMigrations()
    const latestMigration = completedMigrations[completedMigrations.length - 1]
    if(!latestMigration) return output
    const migration = require(__dirname + '/config/migrations/' + latestMigration);
    const result = await migration.down(db.queryInterface, Sequelize);
    const saved = await db.query("DELETE FROM `SequelizeMeta` WHERE name=(:name)", { 
        type: Sequelize.QueryTypes.DELETE, 
        replacements: { name: latestMigration } 
    })
    output.push(result)
    output.push(saved)
    return output
}

module.exports = {
    UpAllMigration,
    downAllMigration,
    downLatestMigration,
}