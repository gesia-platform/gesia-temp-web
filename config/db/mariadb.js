module.exports = {
    host: process.env.GESIA_TEMP_MARIADB_HOST,
    port: process.env.GESIA_TEMP_MARIADB_PORT,
    user: process.env.GESIA_TEMP_MARIADB_USER,
    password: process.env.GESIA_TEMP_MARIADB_PASSWORD,
    database: process.env.GESIA_TEMP_MARIADB_DATABASE,
    connectionLimit: 100,
    connectTimeout: 1000,
    multipleStatements: true,
};
