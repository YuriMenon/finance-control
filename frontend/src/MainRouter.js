import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import Layout from './Layout';
import GraficoGastos from './GraficoGastos';
import Login from './Login';
import CadastroUsuario from './CadastroUsuario';
import CadastroTransacoes from './CadastroTransacoes';
import { useAuth } from './auth/AuthContext';

// Componente para rotas privadas
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  return user || token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

// Componente para rotas públicas
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
};

function MainRouter() {
  return (
    <Routes>
      {/* Rotas para a página de login/cadastro (sem layout) */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/cadastro-usuario" element={
        <PublicRoute>
          <CadastroUsuario />
        </PublicRoute>
      } />
      
      {/* Rotas para as páginas privadas (com layout) */}
      <Route path="/" element={
        <PrivateRoute>
          <HomePage />
        </PrivateRoute>
      } />
      
      <Route path="/cadastro-transacoes" element={
              <PrivateRoute>
                <CadastroTransacoes />
              </PrivateRoute>
            } />
      
      <Route path="/grafico-gastos" element={
        <PrivateRoute>
          <GraficoGastos />
        </PrivateRoute>
      } />
      
      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default MainRouter;