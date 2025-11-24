import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './database.js';
import { format, addMinutes, isToday, parseISO } from 'date-fns';
import cron from 'node-cron';

const JWT_SECRET = 'dental-secret-key';

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de autenticação
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'Agenda Odontológica API - Funcionando!' });
});

// AUTENTICAÇÃO
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  
  db.get('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
    
    // Para admin, verificar senha
    if (user.tipo === 'admin') {
      const validPassword = await bcrypt.compare(senha, user.senha);
      if (!validPassword) return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo, paciente_id: user.paciente_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user.id, email: user.email, tipo: user.tipo } });
  });
});

app.post('/api/register-patient', (req, res) => {
  const { nome, telefone, email } = req.body;
  
  // Criar paciente
  db.run('INSERT INTO pacientes (nome, telefone, email) VALUES (?, ?, ?)', 
    [nome, telefone, email], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Criar usuário
    db.run('INSERT INTO usuarios (email, paciente_id, tipo) VALUES (?, ?, ?)', 
      [email, this.lastID, 'paciente'], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, paciente_id: this.lastID });
    });
  });
});

// PACIENTES
app.get('/api/pacientes', auth, adminAuth, (req, res) => {
  db.all('SELECT * FROM pacientes ORDER BY nome', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/pacientes', auth, adminAuth, (req, res) => {
  const { nome, telefone, email } = req.body;
  db.run('INSERT INTO pacientes (nome, telefone, email) VALUES (?, ?, ?)', 
    [nome, telefone, email], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// PROCEDIMENTOS
app.get('/api/procedimentos', (req, res) => {
  db.all('SELECT * FROM procedimentos', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// AGENDAMENTOS
app.get('/api/agendamentos', auth, (req, res) => {
  const { data } = req.query;
  const isAdmin = req.user.tipo === 'admin';
  
  let query = `
    SELECT a.*, p.nome as paciente_nome, p.telefone, pr.nome as procedimento_nome, pr.duracao, pr.valor
    FROM agendamentos a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN procedimentos pr ON a.procedimento_id = pr.id
  `;
  
  let params = [];
  let conditions = [];
  
  if (!isAdmin) {
    conditions.push('a.paciente_id = ?');
    params.push(req.user.paciente_id);
  }
  
  if (data) {
    conditions.push('DATE(a.data_hora) = ?');
    params.push(data);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Agendamentos do paciente
app.get('/api/meus-agendamentos', auth, (req, res) => {
  if (!req.user.paciente_id) {
    return res.status(400).json({ error: 'Paciente não encontrado' });
  }
  
  const query = `
    SELECT a.*, pr.nome as procedimento_nome, pr.duracao, pr.valor
    FROM agendamentos a
    JOIN procedimentos pr ON a.procedimento_id = pr.id
    WHERE a.paciente_id = ?
    ORDER BY a.data_hora DESC
  `;
  
  db.all(query, [req.user.paciente_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/agendamentos', auth, (req, res) => {
  const { paciente_id, procedimento_id, data_hora, observacoes } = req.body;
  db.run('INSERT INTO agendamentos (paciente_id, procedimento_id, data_hora, observacoes) VALUES (?, ?, ?, ?)', 
    [paciente_id, procedimento_id, data_hora, observacoes], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/agendamentos/:id', auth, adminAuth, (req, res) => {
  const { id } = req.params;
  const { data_hora, status } = req.body;
  db.run('UPDATE agendamentos SET data_hora = ?, status = ? WHERE id = ?', 
    [data_hora, status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

app.delete('/api/agendamentos/:id', auth, adminAuth, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM agendamentos WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Notificar fila de encaixe
    notificarFilaEncaixe();
    res.json({ changes: this.changes });
  });
});

// FILA DE ENCAIXE
app.post('/api/fila-encaixe', (req, res) => {
  const { paciente_id, procedimento_id, data_preferencia } = req.body;
  db.run('INSERT INTO fila_encaixe (paciente_id, procedimento_id, data_preferencia) VALUES (?, ?, ?)', 
    [paciente_id, procedimento_id, data_preferencia], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// VISUALIZAR DADOS DO BANCO
app.get('/api/usuarios', auth, adminAuth, (req, res) => {
  db.all(`SELECT u.id, u.email, u.tipo, u.ativo, p.nome as paciente_nome 
           FROM usuarios u 
           LEFT JOIN pacientes p ON u.paciente_id = p.id 
           ORDER BY u.id`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/database-info', auth, adminAuth, (req, res) => {
  const info = {};
  
  db.get('SELECT COUNT(*) as total FROM usuarios', (err, usuarios) => {
    if (err) return res.status(500).json({ error: err.message });
    info.usuarios = usuarios.total;
    
    db.get('SELECT COUNT(*) as total FROM pacientes', (err, pacientes) => {
      if (err) return res.status(500).json({ error: err.message });
      info.pacientes = pacientes.total;
      
      db.get('SELECT COUNT(*) as total FROM agendamentos', (err, agendamentos) => {
        if (err) return res.status(500).json({ error: err.message });
        info.agendamentos = agendamentos.total;
        
        res.json(info);
      });
    });
  });
});

// DASHBOARD
app.get('/api/dashboard', auth, adminAuth, (req, res) => {
  const hoje = format(new Date(), 'yyyy-MM-dd');
  
  db.get(`SELECT COUNT(*) as total FROM agendamentos WHERE DATE(data_hora) = ? AND status != 'cancelado'`, [hoje], (err, agendamentos) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get(`SELECT SUM(pr.valor) as faturamento FROM agendamentos a 
             JOIN procedimentos pr ON a.procedimento_id = pr.id 
             WHERE DATE(a.data_hora) = ? AND a.status = 'concluido'`, [hoje], (err, faturamento) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.get(`SELECT COUNT(*) as faltas FROM agendamentos WHERE status = 'faltou' AND DATE(data_hora) >= DATE('now', '-30 days')`, (err, faltas) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({
          agendamentos_hoje: agendamentos.total || 0,
          faturamento_hoje: faturamento.faturamento || 0,
          faltas_mes: faltas.faltas || 0
        });
      });
    });
  });
});

// Função para notificar fila de encaixe
function notificarFilaEncaixe() {
  console.log('🔔 Notificando fila de encaixe sobre horário disponível');
  // Aqui integraria com WhatsApp API
}

// Cron job para lembretes automáticos
cron.schedule('0 9 * * *', () => {
  console.log('📱 Enviando lembretes do dia');
  // Aqui integraria com WhatsApp API
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`🗄️ Banco de dados inicializado`);
});