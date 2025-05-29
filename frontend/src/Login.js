import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // Importante > função login do AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !senha) {
      setMensagem('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      // Chama a função login do AuthContext (que já faz a requisição e armazena os dados)
      await login(email, senha); // Passa email e senha diretamente
      
      setMensagem('Login realizado com sucesso!');
      // O redirecionamento já está sendo feito dentro do AuthContext
    } catch (error) {
      setMensagem(error.response?.data?.error || 'Erro ao fazer login');
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>Controle Financeiro</div>
          <p style={styles.slogan}>Gerencie suas finanças de forma simples</p>
        </div>

        <div style={styles.card}>
          <h1 style={styles.titulo}>Login</h1>
          
          <form onSubmit={handleSubmit} style={styles.formulario}>
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
                placeholder="Digite sua senha"
              />
            </div>

            <button 
              type="submit" 
              style={isLoading ? styles.botaoLoading : styles.botao}
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Entrar'}
            </button>
          </form>

          {mensagem && (
            <p style={mensagem.includes('sucesso') ? styles.mensagemSucesso : styles.mensagemErro}>
              {mensagem}
            </p>
          )}

          <div style={styles.rodape}>
            <p style={styles.textoRodape}>Ainda não tem uma conta? <a href="/cadastro-usuario" style={styles.link}>Cadastre-se</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos atualizados
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
  inputFocus: {
    border: '1px solid #6e8efb',
    outline: 'none',
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
  },
};

export default Login;