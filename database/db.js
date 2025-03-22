require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Criar um pool de conexões
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const runMigrations = async () => {
  try {
    const migrationsPath = path.join(__dirname, "migrations.sql");
    const migrationsSQL = fs.readFileSync(migrationsPath, { encoding: "utf-8" });

    await pool.query(migrationsSQL);
    console.log("Migrações aplicadas com sucesso!");
  } catch (error) {
    console.error("Erro ao rodar migrações: ", error);
  }
}

(async () => {
  try {
    await runMigrations();
  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);
  }
})();

pool.on("connect", () => {
  console.log("Conectado ao banco de dados PostgreSQL!");
});

module.exports = pool;