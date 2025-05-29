const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'sua_chave_secreta_super_segura';

app.use(cors());
app.use(bodyParser.json());

// Inicializar o banco de dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite');
    initializeDatabase();
  }
});

function initializeDatabase() {
  //Criando a tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela de usuários:', err.message);
    } else {
      console.log('Tabela de Usuários verificada/criada');
    }
  });

  //Criando a tabela de transações
  db.run(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('receita', 'despesa')),
      valor REAL NOT NULL,
      descricao TEXT,
      categoria TEXT NOT NULL,
      data TEXT NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela de transações:', err.message);
    } else {
      console.log('Tabela de transações verificada/criada');
    }
  });
}


// Rota de cadastro
app.post('/api/auth/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Verificar se o email já está cadastrado
    db.get('SELECT email FROM usuarios WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Erro no servidor' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Criptografar a senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Inserir novo usuário
      db.run(
        'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
        [nome, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
          }
          
          // Criar token JWT
          const token = jwt.sign({ id: this.lastID, email }, SECRET_KEY, { expiresIn: '1h' });
          
          res.status(201).json({ 
            message: 'Usuário cadastrado com sucesso',
            token 
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/api/transacoes', authenticateToken, (req, res) => {
  const { tipo, valor, descricao, categoria, data } = req.body;
  const usuario_id = req.user.id;

  // Validação
  if (!tipo || !valor || !data || !categoria) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  db.run(
    `INSERT INTO transacoes 
    (usuario_id, tipo, valor, descricao, categoria, data) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario_id, tipo, parseFloat(valor), descricao, categoria, data],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao salvar transação' });
      }
      res.status(201).json({ 
        id: this.lastID,
        message: `Transação (${tipo}) cadastrada com sucesso!`,
        tipo
      });
    }
  );
});

// Rota para listar categorias disponíveis
app.get('/api/categorias', authenticateToken, (req, res) => {
  res.json({
    receita: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
    despesa: ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Outros']
  });
});

// Rota para validar token
app.get('/api/auth/validate', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Rota para listar transações
app.get('/api/transacoes', authenticateToken, (req, res) => {
  const { startDate, endDate } = req.query;
  const usuario_id = req.user.id;

  let query = 'SELECT * FROM transacoes WHERE usuario_id = ?';
  const params = [usuario_id];

  if (startDate && endDate) {
    query += ' AND date(data) BETWEEN date(?) AND date(?)';
    params.push(startDate, endDate);
  }

  query += ' ORDER BY data DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar transações:', err);
      return res.status(500).json({ error: 'Erro ao buscar transações' });
    }
    res.json(rows);
  });
});

// Rota para atualizar transação - ( quando o usuário edita)
app.put('/api/transacoes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { descricao, valor, categoria, data } = req.body;
  
  db.run(
    `UPDATE transacoes 
     SET descricao = ?, valor = ?, categoria = ?, data = ?
     WHERE id = ? AND usuario_id = ?`,
    [descricao, valor, categoria, data, id, req.user.id],
    function(err) {
      if (err) {
        console.error('Erro ao atualizar transação:', err);
        return res.status(500).json({ error: 'Erro ao atualizar transação' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
      res.json({ message: 'Transação atualizada com sucesso' });
    }
  );
});

// Rota para excluir transação
app.delete('/api/transacoes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    `DELETE FROM transacoes 
     WHERE id = ? AND usuario_id = ?`,
    [id, req.user.id],
    function(err) {
      if (err) {
        console.error('Erro ao excluir transação:', err);
        return res.status(500).json({ error: 'Erro ao excluir transação' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
      res.json({ message: 'Transação excluída com sucesso' });
    }
  );
});

// Rota de login
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro no servidor' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Criar token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    
    res.json({ 
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    });
  });
});

// Middleware para verificar token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Rota protegida de exemplo
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Rota protegida acessada com sucesso', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});