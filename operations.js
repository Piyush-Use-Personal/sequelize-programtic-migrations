const Sequelize = require('sequelize');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config')[env];

class SequelizeOperations {
    constructor() {
        if (config.use_env_variable) {
            this.db = new Sequelize(config.url, config);
        } else {
            this.db = new Sequelize(config.database, config.username, config.password, config);
        }
    }

    async get() {
        const migrations = fs.readdirSync(__dirname + '/config/migrations');
        const dbMigrations = await this.db.query("SELECT * FROM `SequelizeMeta`", { type: Sequelize.QueryTypes.SELECT });
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

    async up(migration) {
        const migration = require(__dirname + '/config/migrations/' + migration);
        const result = await migration.up(this.db.queryInterface, Sequelize);
        await db.query("INSERT INTO `SequelizeMeta` VALUES(:name)", { type: Sequelize.QueryTypes.INSERT, replacements: { name: migration } })
        return result
    }

    async down(migration) {
        if (!migration) return output
        const migration = require(__dirname + '/config/migrations/' + migration);
        const result = await migration.down(this.db.queryInterface, Sequelize);
        await db.query("DELETE FROM `SequelizeMeta` WHERE name=(:name)", { type: Sequelize.QueryTypes.DELETE, replacements: { name: migration } })
        return result
    }

    async downLatest() {
        const output = []
        const { completedMigrations } = await getAllMigrations()
        const latestMigration = completedMigrations[completedMigrations.length - 1]
        output.push(await this.down(latestMigration))
        return output
    }

    async downAll() {
        const output = []
        const { completedMigrations } = await getAllMigrations()
        for (let i = 0, c = migrations.length; i < c; i++) {
            output.push(await this.down(completedMigrations[i]))
        }
        return output
    }

    async upAll() {
        const { pendingMigrations } = await this.getAllMigrations()
        const output = []
        for (let i = 0, c = pendingMigrations.length; i < c; i++) {
            output.push(await this.up(pendingMigrations[i]))
        }
        return output
    }
}

module.exports = new SequelizeOperations()