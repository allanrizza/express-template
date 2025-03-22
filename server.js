const express = require("express");
const pool = require("./database/db"); // Importa a conexão
const bcrypt = require("bcryptjs"); // Biblioteca para criptografar senhas
const jwt = require("jwt-simple"); // Biblioteca para gerar JWT
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json()); 

app.get("/", (req, res) => {
    res.send("Hello EXPRESS");
});

app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM USERS");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.post("/register", async (req, res) => {
    const {name, username, password} = req.body;

    if(!name || !username || !password) {
        return res.status(400).send("Nome, usuário e senha são obrigatórios");
    }

    try {
        const userExist = await pool.query("SELECT * FROM USERS WHERE USERNAME = $1", [username]);
        if(userExist.rowCount > 0) {
            return res.status(400).send("Usuário com esse username já existe");
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, username, password) VALUES ($1, $2, $3) RETURNING id, username",
            [name, username, hashedPassword]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    };
});