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
    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    const createMigrationsTableSQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    `;  

    await pool.query(createMigrationsTableSQL); 
    console.log("Tabela 'migrations' criada com sucesso ou já existe.");
    
    for(const file of migrationFiles) {
      if(file.endsWith(".sql")) {
        const migrationName = file;

        const migrationResult = await pool.query(
          "SELECT * FROM migrations WHERE name = $1", [migrationName]
        );

        if(migrationResult.rows.length === 0) {
          const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), {encoding: "utf-8"});
        
          await pool.query(migrationSQL);
          console.log(`Migração "${migrationName}" aplicada com sucesso.`);

          await pool.query(
            "INSERT INTO migrations (name) VALUES ($1)",
            [migrationName]
          );
          console.log(`Migração "${migrationName}" registrada com sucesso.`);
        } else {
          console.log(`Migração "${migrationName}" já foi aplicada.`)
        }
      }
    }
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