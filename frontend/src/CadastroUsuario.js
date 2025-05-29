import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CadastroUsuario = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    if (!nome || !email || !senha || !confirmarSenha) {
      setMensagem('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }
  
    if (senha !== confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }
  
    if (senha.length < 6) {
      setMensagem('A senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/cadastro', {
        nome,
        email,
        senha
      });
  
      setMensagem('Cadastro realizado com sucesso!');
      setTimeout(() => navigate('/login'), 1500);
  
    } catch (error) {
      setMensagem(error.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setIsLoading(false);
    }
  };

  // Seu JSX original (mantido integralmente)
  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>Controle Financeiro</div>
          <p style={styles.slogan}>Comece a gerenciar suas finanças hoje</p>
        </div>

        <div style={styles.card}>
          <h1 style={styles.titulo}>Criar Conta</h1>
          
          <form onSubmit={handleSubmit} style={styles.formulario}>
            <div style={styles.campo}>
              <label htmlFor="nome" style={styles.label}>Nome completo</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={styles.input}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div style={styles.campo}>
              <label htmlFor="email" style={styles.label}>E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="Digite seu e-mail"
              />
            </div>

            <div style={styles.campo}>
              <label htmlFor="senha" style={styles.label}>Senha</label>
              <input
                type="password"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={styles.input}
                placeholder="Crie uma senha"
              />
              <p style={styles.dicaSenha}>Use pelo menos 6 caracteres</p>
            </div>

            <div style={styles.campo}>
              <label htmlFor="confirmarSenha" style={styles.label}>Confirme sua senha</label>
              <input
                type="password"
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                style={styles.input}
                placeholder="Digite a senha novamente"
              />
            </div>

            <button 
              type="submit" 
              style={isLoading ? styles.botaoLoading : styles.botao}
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Criar Conta'}
            </button>
          </form>

          {mensagem && (
            <p style={mensagem.includes('sucesso') ? styles.mensagemSucesso : styles.mensagemErro}>
              {mensagem}
            </p>
          )}

          <div style={styles.rodape}>
            <p style={styles.textoRodape}>
              Já tem uma conta? 
              <a 
                href="/login" 
                style={styles.link}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                Faça login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  background: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #2c3e50, #a777e3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '30px',
    color: 'white',
  },
  logo: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  slogan: {
    fontSize: '1.2rem',
    opacity: 0.9,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    transition: 'all 0.3s ease',
  },
  titulo: {
    textAlign: 'center',
    color: '#333',
    fontSize: '28px',
    marginBottom: '30px',
    fontWeight: '600',
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    color: '#555',
    fontWeight: '500',
  },
  input: {
    padding: '15px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    transition: 'border 0.3s',
  },
  dicaSenha: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  botao: {
    padding: '15px',
    fontSize: '16px',
    backgroundColor: '#6e8efb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  botaoLoading: {
    padding: '15px',
    fontSize: '16px',
    backgroundColor: '#ccc',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'not-allowed',
    marginTop: '10px',
    fontWeight: '600',
  },
  mensagemSucesso: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#4CAF50',
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#f0fff0',
    borderRadius: '5px',
  },
  mensagemErro: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#f44336',
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#fff0f0',
    borderRadius: '5px',
  },
  rodape: {
    marginTop: '30px',
    textAlign: 'center',
    borderTop: '1px solid #eee',
    paddingTop: '20px',
  },
  textoRodape: {
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#6e8efb',
    textDecoration: 'none',
    fontWeight: '500',
    marginLeft: '5px',
  },
};

export default CadastroUsuario;