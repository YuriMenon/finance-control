import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './auth/AuthContext';

const CadastroTransacoes = () => {
  const [tipo, setTipo] = useState('receita');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categorias, setCategorias] = useState({
    receita: [],
    despesa: []
  });

  // Carrega categorias do backend ao iniciar
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categorias', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    
    loadCategorias();
    
    // Define a data atual como padrão
    const today = new Date().toISOString().split('T')[0];
    setData(today);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!descricao || !valor || !data || !categoria) {
      setMensagem('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/transacoes', {
        tipo,
        descricao,
        valor,
        data,
        categoria
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setMensagem(response.data.message);
      
      // Limpa o formulário (exceto o tipo)
      setDescricao('');
      setValor('');
      setCategoria('');
      
    } catch (error) {
      setMensagem(error.response?.data?.error || 'Erro ao cadastrar transação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Cadastro de Transações</h1>
  
      <form onSubmit={handleSubmit} style={styles.formulario}>
        <div style={styles.campo}>
          <label htmlFor="tipo" style={styles.label}>Tipo:</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setCategoria('');
            }}
            style={styles.input}
            disabled={isLoading}
          >
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </div>
  
        <div style={styles.campo}>
          <label htmlFor="categoria" style={styles.label}>Categoria:</label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={styles.input}
            disabled={isLoading}
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias[tipo]?.map((cat, index) => (
              <option key={`${tipo}-${index}`} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
  
        <div style={styles.campo}>
          <label htmlFor="valor" style={styles.label}>Valor (R$):</label>
          <input
            type="number"
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            style={styles.input}
            placeholder={tipo === 'receita' ? "Ex: 3000" : "Ex: 1200"}
            step="0.01"
            min="0.01"
            disabled={isLoading}
            required
          />
        </div>
  
        <div style={styles.campo}>
          <label htmlFor="data" style={styles.label}>Data:</label>
          <input
            type="date"
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={styles.input}
            max={new Date().toISOString().split('T')[0]} // Não permite datas futuras
            disabled={isLoading}
            required
          />
        </div>
  
        <div style={styles.campo}>
          <label htmlFor="descricao" style={styles.label}>Descrição:</label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={styles.input}
            placeholder={tipo === 'receita' ? "Ex: Salário" : "Ex: Aluguel"}
            disabled={isLoading}
            required
            maxLength={100}
          />
        </div>
  
        <button 
          type="submit" 
          style={{
            ...styles.botao,
            backgroundColor: tipo === 'receita' ? '#4CAF50' : '#F44336',
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'wait' : 'pointer'
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span>Salvando...</span>
          ) : (
            <span>Cadastrar {tipo === 'receita' ? 'Receita' : 'Despesa'}</span>
          )}
        </button>
      </form>
  
      {mensagem && (
        <p style={{
          ...styles.mensagem,
          color: mensagem.includes('sucesso') ? '#4CAF50' : '#F44336',
          backgroundColor: mensagem.includes('sucesso') ? '#f0fff0' : '#fff0f0',
          padding: '10px',
          borderRadius: '4px'
        }}>
          {mensagem}
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f9',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  titulo: {
    textAlign: 'center',
    color: '#333',
    fontSize: '28px',
    marginBottom: '20px',
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '16px',
    color: '#555',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  botao: {
    padding: '10px',
    fontSize: '16px',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  mensagem: {
    textAlign: 'center',
    fontSize: '16px',
    marginTop: '20px',
  },
};

export default CadastroTransacoes;