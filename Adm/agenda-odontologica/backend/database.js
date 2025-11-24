import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('agenda.db');

// Inicializar tabelas
db.serialize(() => {
  // Pacientes
  db.run(`CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Procedimentos
  db.run(`CREATE TABLE IF NOT EXISTS procedimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    duracao INTEGER NOT NULL,
    valor REAL
  )`);

  // Agendamentos
  db.run(`CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER,
    procedimento_id INTEGER,
    data_hora DATETIME NOT NULL,
    status TEXT DEFAULT 'agendado',
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes (id),
    FOREIGN KEY (procedimento_id) REFERENCES procedimentos (id)
  )`);

  // Fila de encaixe
  db.run(`CREATE TABLE IF NOT EXISTS fila_encaixe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER,
    procedimento_id INTEGER,
    data_preferencia DATE,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes (id),
    FOREIGN KEY (procedimento_id) REFERENCES procedimentos (id)
  )`);

  // Usuários (admin e pacientes)
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    senha TEXT,
    tipo TEXT DEFAULT 'paciente',
    paciente_id INTEGER,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
  )`);

  // Inserir admin padrão (senha: password)
  db.run(`INSERT OR IGNORE INTO usuarios (id, email, senha, tipo) VALUES 
    (1, 'admin@dental.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')`);

  // Inserir procedimentos padrão
  db.run(`INSERT OR IGNORE INTO procedimentos (id, nome, duracao, valor) VALUES 
    (1, 'Consulta', 30, 80.00),
    (2, 'Limpeza', 45, 120.00),
    (3, 'Obturação', 60, 200.00),
    (4, 'Extração', 45, 150.00),
    (5, 'Canal', 90, 400.00)`);
});

export default db;