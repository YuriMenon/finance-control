import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Menu Lateral */}
      <nav style={styles.menuLateral}>
        <div style={styles.logo}>Controle Financeiro</div>
        
        <Link to="/" style={styles.menuItem}>
          <span style={styles.menuIcon}>🏠</span> Home
        </Link>
        
        <Link to="/cadastro-transacoes" style={styles.menuItem}>
          <span style={styles.menuIcon}>➕</span> Transações
        </Link>
        
        <Link to="/grafico-gastos" style={styles.menuItem}>
          <span style={styles.menuIcon}>📊</span> Gráficos
        </Link>
        
        <div 
          style={{...styles.menuItem, cursor: 'pointer'}} 
          onClick={handleLogout}
        >
          <span style={styles.menuIcon}>🚪</span> Sair
        </div>
        
        {/* Mostra informações do usuário */}
        {user && (
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.nome}</div>
            <div style={styles.userEmail}>{user.email}</div>
          </div>
        )}
      </nav>

      {/* Conteúdo Principal */}
      <main style={styles.conteudoPrincipal}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  menuLateral: {
    width: '250px',
    background: 'linear-gradient(135deg, #2c3e50, #a777e3)',
    color: 'white',
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh', // Garante que ocupa toda a altura
    position: 'fixed', // Fixa o menu
    height: '100%', // Ocupa 100% da altura
    overflowY: 'auto', // Adiciona scroll se necessário
  },
  logo: {
    padding: '0 20px 20px',
    fontSize: '20px',
    fontWeight: 'bold',
    borderBottom: '1px solid #34495e',
    marginBottom: '20px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    color: 'white',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }
  },
  menuIcon: {
    marginRight: '10px',
    fontSize: '20px',
  },
  conteudoPrincipal: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#f5f6fa',
    marginLeft: '250px', // Adiciona margem igual à largura do menu
    minHeight: '100vh', // Garante que o conteúdo também ocupa toda a altura
  },
  userInfo: {
    marginTop: 'auto', // Empurra para o final do menu
    padding: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  userEmail: {
    fontSize: '12px',
    opacity: 0.8,
  }
};

export default Layout;