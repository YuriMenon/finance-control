import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { useAuth } from './auth/AuthContext';
import { format } from 'date-fns';

// Registra todos os componentes necessários
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const GraficoGastos = () => {
  const { user } = useAuth();
  const [mes, setMes] = useState(format(new Date(), 'yyyy-MM'));
  const [tipoGrafico, setTipoGrafico] = useState('pizza'); // 'pizza' ou 'barras'
  const [dadosGrafico, setDadosGrafico] = useState({
    labels: [],
    datasets: [
      {
        label: 'Gastos por Categoria',
        data: [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF8A80', '#A5D6A7', '#90CAF9', '#CE93D8'
        ],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDespesas = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const startDate = `${mes}-01`;
        const endDate = `${mes}-31`;
        
        const response = await axios.get(
          `http://localhost:5000/api/transacoes?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const despesas = response.data.filter(transacao => transacao.tipo === 'despesa');

        const gastosPorCategoria = despesas.reduce((acc, despesa) => {
          if (!acc[despesa.categoria]) {
            acc[despesa.categoria] = 0;
          }
          acc[despesa.categoria] += despesa.valor;
          return acc;
        }, {});

        // Ordena as categorias por valor (do maior para o menor)
        const categoriasOrdenadas = Object.entries(gastosPorCategoria)
          .sort((a, b) => b[1] - a[1]);

        const labels = categoriasOrdenadas.map(item => item[0]);
        const data = categoriasOrdenadas.map(item => item[1]);

        setDadosGrafico(prev => ({
          ...prev,
          labels: labels,
          datasets: [
            {
              ...prev.datasets[0],
              data: data,
            },
          ],
        }));

      } catch (err) {
        console.error('Erro ao buscar despesas:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchDespesas();
  }, [mes, user]);

  // Opções comuns para ambos os gráficos
  const opcoesComuns = {
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            if (tipoGrafico === 'pizza') {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
            }
            return `${label}: R$ ${value.toFixed(2)}`;
          }
        }
      },
    },
  };

  // Opções específicas para gráfico de barras
const opcoesBarras = {
  ...opcoesComuns,
  plugins: {
    ...opcoesComuns.plugins,
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Valor (R$)'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Categorias'
      }
    }
  }
};

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Gráfico de Gastos por Categoria</h1>

      <div style={styles.controles}>
        <div style={styles.filtro}>
          <label htmlFor="mes" style={styles.label}>Selecione o mês: </label>
          <input
            type="month"
            id="mes"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
        </div>

        <div style={styles.filtro}>
          <label htmlFor="tipoGrafico" style={styles.label}>Tipo de gráfico: </label>
          <select
            id="tipoGrafico"
            value={tipoGrafico}
            onChange={(e) => setTipoGrafico(e.target.value)}
            style={styles.input}
            disabled={loading}
          >
            <option value="pizza">Pizza</option>
            <option value="barras">Barras</option>
          </select>
        </div>
      </div>

      <div style={styles.graficoContainer}>
        {loading ? (
          <p style={styles.mensagem}>Carregando dados...</p>
        ) : error ? (
          <p style={{ ...styles.mensagem, color: '#FF0000' }}>{error}</p>
        ) : dadosGrafico.labels.length > 0 ? (
          <>
            <p style={styles.total}>Total de gastos no mês: R$ {
              dadosGrafico.datasets[0].data.reduce((a, b) => a + b, 0).toFixed(2)
            }</p>
            
            {tipoGrafico === 'pizza' ? (
              <Pie data={dadosGrafico} options={opcoesComuns} />
            ) : (
              <Bar data={dadosGrafico} options={opcoesBarras} />
            )}
          </>
        ) : (
          <p style={styles.mensagem}>Nenhuma despesa cadastrada para o mês selecionado.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
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
  controles: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '20px',
  },
  filtro: {
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    fontSize: '16px',
    color: '#555',
    marginRight: '10px',
  },
  input: {
    padding: '8px 12px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  graficoContainer: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mensagem: {
    fontSize: '18px',
    color: '#555',
  },
  total: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '20px',
    color: '#333'
  }
};

export default GraficoGastos;