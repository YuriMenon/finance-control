import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './auth/AuthContext';
import { format, parseISO, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HomePage = () => {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [saldo, setSaldo] = useState(0);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState(null);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [mostrarAlertaGastos, setMostrarAlertaGastos] = useState(true);
  const maxMonth = format(new Date(), 'yyyy-MM');

  // Formatar data para exibição (ex: "Outubro 2023")
 // Formatar data para exibição e para a API
 const formattedDate = format(currentDate, 'MMMM yyyy', { locale: ptBR });
 const formattedDateForAPI = format(currentDate, 'yyyy-MM');

 // Formatar para o input month (yyyy-MM)
 const monthInputValue = format(currentDate, 'yyyy-MM');

 // Buscar transações do mês selecionado
 useEffect(() => {
   const fetchTransacoes = async () => {
     try {
       setLoading(true);
       const response = await axios.get(
         `http://localhost:5000/api/transacoes?startDate=${formattedDateForAPI}-01&endDate=${formattedDateForAPI}-31`,
         {
           headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`
           }
         }
       );

       setTransacoes(response.data);
       
       // Cálculo dos totais
       const receitas = response.data.filter(t => t.tipo === 'receita');
       const despesas = response.data.filter(t => t.tipo === 'despesa');
       
       const totalR = receitas.reduce((acc, t) => acc + t.valor, 0);
       const totalD = despesas.reduce((acc, t) => acc + t.valor, 0);
       
       setTotalReceitas(totalR);
       setTotalDespesas(totalD);
       setSaldo(totalR - totalD);

       // Verifica se gastou 75% ou mais da receita 
      if (totalR > 0 && (totalD / totalR) >= 0.75) {
        setMostrarAlertaGastos(true);
      }
       
     } catch (error) {
       console.error('Erro ao buscar transações:', error);
     } finally {
       setLoading(false);
     }
   };

   if (user) {
     fetchTransacoes();
   }
 }, [formattedDateForAPI, user]);

   // Manipulador de mudança de mês
   const handleMonthChange = (e) => {
    const value = e.target.value; // Ex: "2023-10" ou ""

    if (value) { // Se o valor não for uma string vazia
      const [yearStr, monthStr] = value.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);

      // Verifica se year e month são números válidos após o parse
      if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
        const newDate = new Date(year, month - 1, 1); // month - 1 pois os meses em Date são 0-indexados
        setCurrentDate(newDate);
      } else {
        // Valor inválido (não deveria acontecer com input type="month" a menos que
        console.warn('Formato de mês inválido:', value);
        goToCurrentMonth(); // Ou alguma outra lógica de fallback
      }
    } else {
      // O campo foi limpo (botão "X" clicado ou texto deletado)
      goToCurrentMonth();
    }
  };

  // Voltar para o mês atual
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Agrupar transações por dia
  const transacoesPorDia = transacoes.reduce((acc, transacao) => {
    const date = transacao.data;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transacao);
    return acc;
  }, {});

  const buscarTransacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/transacoes?startDate=${formattedDateForAPI}-01&endDate=${formattedDateForAPI}-31`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
  
      const transacoesAtualizadas = response.data;
      setTransacoes(transacoesAtualizadas);
  
      // Calcula totais diretamente das transações atualizadas
      const receitas = transacoesAtualizadas.filter(t => t.tipo === 'receita');
      const despesas = transacoesAtualizadas.filter(t => t.tipo === 'despesa');
      
      const totalR = receitas.reduce((acc, t) => acc + t.valor, 0);
      const totalD = despesas.reduce((acc, t) => acc + t.valor, 0);
      
      setTotalReceitas(totalR);
      setTotalDespesas(totalD);
      setSaldo(totalR - totalD);
  
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      buscarTransacoes();
    }
  }, [formattedDateForAPI, user]);



  

  // Função para abrir modal de edição
  const abrirModalEdicao = (transacao) => {
    setTransacaoEditando({
      ...transacao,
      tipo: transacao.tipo // Garante que o tipo está disponível
    });
    setModalEdicaoAberto(true);
  };

  // Função para salvar edição
  const salvarEdicao = async () => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/transacoes/${transacaoEditando.id}`,
        {
          descricao: transacaoEditando.descricao,
          valor: transacaoEditando.valor,
          categoria: transacaoEditando.categoria,
          data: transacaoEditando.data
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Atualiza a lista chamando buscarTransacoes
      await buscarTransacoes();
      setModalEdicaoAberto(false);
      
    } catch (error) {
      console.error('Erro ao editar transação:', {
        message: error.message,
        response: error.response?.data
      });
      setMensagem('Erro ao editar transação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para confirmar exclusão
  const confirmarExclusao = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/transacoes/${transacaoParaExcluir.id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Atualiza a lista de transações
      buscarTransacoes();
      setModalConfirmacaoAberto(false);
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  // Filtrar receitas e despesas para os novos cards
  const receitas = transacoes.filter(t => t.tipo === 'receita');
  const despesas = transacoes.filter(t => t.tipo === 'despesa');

  return (
    <div style={styles.container}>
      <main style={styles.conteudoPrincipal}>
      <div style={styles.header}>
          <h1 style={styles.titulo}>Dashboard Financeiro</h1>
          
          <div style={styles.monthSelector}>
            <input
              type="month"
              value={monthInputValue}
              onChange={handleMonthChange}
              style={styles.monthInput}
              max={maxMonth} // não permite datas futuras
            />
            
            <button 
              onClick={goToCurrentMonth} 
              style={styles.currentMonthButton}
            >
              Mês Atual
            </button>
          </div>
        </div>
        
        {/* Primeira linha com 3 cards */}
        <div style={styles.gridTop}>
          {/* Card de Resumo */}
          <div style={styles.card}>
  <h2>Resumo do Mês</h2>
  
  {loading ? (
    <p>Carregando...</p>
  ) : (
    <>
      <div style={styles.saldoContainer}>
        <p style={styles.saldoTitulo}>Saldo do Mês</p>
        <p style={{ 
          ...styles.saldoValor,
          color: saldo >= 0 ? '#4CAF50' : '#F44336'
        }}>
          R$ {saldo.toFixed(2)}
        </p>
      </div>
      {/* Aviso de gastos excessivos */}
      {mostrarAlertaGastos && totalReceitas > 0 && (totalDespesas / totalReceitas) >= 0.75 && (
        <div style={styles.alertaGastos}>
          <div style={styles.alertaContent}>
            <span style={styles.alertaIcon}>⚠️</span>
            <div>
              <p style={styles.alertaTexto}>
                Você já gastou {Math.round((totalDespesas / totalReceitas) * 100)}% da sua receita este mês!
              </p>
              <p style={styles.alertaSubtexto}>Tome cuidado com gastos excessivos.</p>
            </div>
          </div>
          <button 
            onClick={() => setMostrarAlertaGastos(false)}
            style={styles.alertaFechar}
          >
            ×
          </button>
        </div>
      )}
    </>
  )}
</div>
  
          {/* Card de Receitas */}
          <div style={styles.card}>
            <h2>📈 Receitas</h2>
            <p style={styles.totalCard}>Total: R$ {totalReceitas.toFixed(2)}</p>
            
            {loading ? (
              <p>Carregando...</p>
            ) : receitas.length === 0 ? (
              <p>Nenhuma receita neste período</p>
            ) : (
              <div style={styles.listaSimples}>
                {receitas.slice(0, 5).map(transacao => (
                  <div key={transacao.id} style={styles.itemSimples}>
                    <div style={styles.infoTransacao}>
                      <p style={styles.descricao}>{transacao.descricao}</p>
                      <p style={styles.detalhes}>
                        {transacao.categoria} • {format(parseISO(transacao.data), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <p style={styles.valorPositivo}>
                      R$ {transacao.valor.toFixed(2)}
                    </p>
                  </div>
                ))}
                {receitas.length > 5 && (
                  <p style={styles.maisItens}>+ {receitas.length - 5} receitas</p>
                )}
              </div>
            )}
          </div>
  
          {/* Card de Despesas */}
          <div style={styles.card}>
            <h2>📉 Despesas</h2>
            <p style={styles.totalCard}>Total: R$ {totalDespesas.toFixed(2)}</p>
            
            {loading ? (
              <p>Carregando...</p>
            ) : despesas.length === 0 ? (
              <p>Nenhuma despesa neste período</p>
            ) : (
              <div style={styles.listaSimples}>
                {despesas.slice(0, 5).map(transacao => (
                  <div key={transacao.id} style={styles.itemSimples}>
                    <div style={styles.infoTransacao}>
                      <p style={styles.descricao}>{transacao.descricao}</p>
                      <p style={styles.detalhes}>
                        {transacao.categoria} • {format(parseISO(transacao.data), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <p style={styles.valorNegativo}>
                      R$ {transacao.valor.toFixed(2)}
                    </p>
                  </div>
                ))}
                {despesas.length > 5 && (
                  <p style={styles.maisItens}>+ {despesas.length - 5} despesas</p>
                )}
              </div>
            )}
          </div>
        </div>
  
        {/* Card de Transações (na parte inferior) */}
        <div style={styles.card}>
          <h2>Todas as Transações</h2>
          
          {loading ? (
            <p>Carregando transações...</p>
          ) : transacoes.length === 0 ? (
            <p>Nenhuma transação neste período</p>
          ) : (
            <div style={styles.listaContainer}>
              {Object.entries(transacoesPorDia).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([date, transacoesDia]) => (
                <div key={date}>
                  <div style={styles.dayHeader}>
                    {format(parseISO(date), 'PPPP', { locale: ptBR })}
                  </div>
                  
                  {transacoesDia.map(transacao => (
                    <div key={transacao.id} style={styles.itemTransacao}>
                      <div style={styles.infoTransacao}>
                        <p style={styles.descricao}>{transacao.descricao}</p>
                        <p style={styles.detalhes}>
                          {transacao.categoria} • {format(parseISO(transacao.data), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div style={styles.valorContainer}>
                        <p style={{
                          ...styles.valor,
                          color: transacao.tipo === 'receita' ? '#4CAF50' : '#F44336'
                        }}>
                          R$ {transacao.valor.toFixed(2)}
                        </p>
                        <div style={styles.botoesAcao}>
                          <button 
                            onClick={() => abrirModalEdicao(transacao)}
                            style={styles.botaoEditar}
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => {
                              setTransacaoParaExcluir(transacao);
                              setModalConfirmacaoAberto(true);
                            }}
                            style={styles.botaoExcluir}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
  
      {/* Modal de Edição */}
      {modalEdicaoAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Editar Transação</h3>
            
            <div style={styles.campoModal}>
              <label>Descrição:</label>
              <input
                type="text"
                value={transacaoEditando.descricao}
                onChange={(e) => setTransacaoEditando({
                  ...transacaoEditando,
                  descricao: e.target.value
                })}
                style={styles.inputModal}
              />
            </div>
            
            <div style={styles.campoModal}>
              <label>Valor (R$):</label>
              <input
                type="number"
                value={transacaoEditando.valor}
                onChange={(e) => setTransacaoEditando({
                  ...transacaoEditando,
                  valor: parseFloat(e.target.value) || 0
                })}
                style={styles.inputModal}
                step="0.01"
                min="0.01"
              />
            </div>
            
            <div style={styles.campoModal}>
              <label>Categoria:</label>
              <select
                value={transacaoEditando.categoria}
                onChange={(e) => setTransacaoEditando({
                  ...transacaoEditando,
                  categoria: e.target.value
                })}
                style={styles.inputModal}
              >
                <option value="">Selecione uma categoria</option>
                {transacaoEditando.tipo === 'receita' ? (
                  <>
                    <option value="Salário">Salário</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investimentos">Investimentos</option>
                    <option value="Outros">Outros</option>
                  </>
                ) : (
                  <>
                    <option value="Moradia">Moradia</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Outros">Outros</option>
                  </>
                )}
              </select>
            </div>
            
            <div style={styles.campoModal}>
              <label>Data:</label>
              <input
                type="date"
                value={transacaoEditando.data}
                onChange={(e) => setTransacaoEditando({
                  ...transacaoEditando,
                  data: e.target.value
                })}
                style={styles.inputModal}
                max={new Date().toISOString().split('T')[0]} // Não permite datas futuras
              />
            </div>
            
            <div style={styles.botoesModal}>
              <button 
                onClick={() => setModalEdicaoAberto(false)}
                style={styles.botaoCancelar}
              >
                Cancelar
              </button>
              <button 
                onClick={salvarEdicao}
                style={styles.botaoSalvar}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Modal de Confirmação de Exclusão */}
      {modalConfirmacaoAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir esta transação?</p>
            <p style={styles.detalhesTransacao}>
              <strong>{transacaoParaExcluir?.descricao}</strong><br />
              Valor: R$ {transacaoParaExcluir?.valor.toFixed(2)}<br />
              Data: {transacaoParaExcluir?.data && format(parseISO(transacaoParaExcluir.data), 'dd/MM/yyyy')}
            </p>
            
            <div style={styles.botoesModal}>
              <button 
                onClick={() => setModalConfirmacaoAberto(false)}
                style={styles.botaoCancelar}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarExclusao}
                style={styles.botaoExcluirModal}
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de feedback */}
      {mensagem && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '15px',
          backgroundColor: mensagem.includes('sucesso') ? '#4CAF50' : '#F44336',
          color: 'white',
          borderRadius: '4px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          {mensagem}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  conteudoPrincipal: {
    flex: 1,
    padding: '20px 5% 20px 20px', /* 5% padding à direita */
    backgroundColor: '#f5f6fa',
    marginLeft: '250px',
    minHeight: '100vh',
    maxWidth: '1400px', /* Largura máxima do conteúdo */
    margin: '0 auto', /* Centraliza o conteúdo */
    width: '100%',
    boxSizing: 'border-box',
  },
  gridTop: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
    maxWidth: '100%', /* Garante que não ultrapasse o conteudoPrincipal */
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '40px', /* Espaço extra na parte inferior */
    minHeight: '300px', /* Altura mínima */
    maxHeight: 'calc(100vh - 300px)', /* Altura máxima baseada na viewport */
    overflow: 'hidden', /* Esconde qualquer conteúdo que ultrapasse */
  },
  saldoContainer: {
    textAlign: 'center',
    margin: '20px 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  saldoTitulo: {
    fontSize: '18px',
    color: '#7f8c8d',
    marginBottom: '10px',
  },
  saldoValor: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '10px 0 20px 0',
  },
  resumo: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '16px',
    marginTop: 'auto',
  },
  listaContainer: {
    flex: 1, /* Ocupa todo o espaço disponível no card */
    overflowY: 'auto', /* Scroll apenas quando necessário */
    paddingRight: '10px',
    paddingBottom: '20px', /* Espaço interno na parte inferior */
  },
  listaSimples: {
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '10px',
  },
  itemTransacao: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0',
    borderBottom: '1px solid #eee',
  },
  itemSimples: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
    alignItems: 'center',
  },
  infoTransacao: {
    flex: 1,
  },
  descricao: {
    fontWeight: 'bold',
    margin: 0,
    fontSize: '14px',
  },
  detalhes: {
    color: '#95a5a6',
    fontSize: '12px',
    margin: '5px 0 0',
  },
  valorContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  valor: {
    fontWeight: 'bold',
    marginRight: '15px',
  },
  valorPositivo: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  valorNegativo: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  botoesAcao: {
    display: 'flex',
    gap: '8px',
    marginLeft: '15px'
  },
  botaoEditar: {
    padding: '6px 12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  botaoExcluir: {
    padding: '6px 12px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  monthButton: {
    background: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  monthTitle: {
    margin: 0,
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  currentMonthButton: {
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  dayHeader: {
    backgroundColor: '#f5f6fa',
    padding: '8px 12px',
    borderRadius: '5px',
    margin: '15px 0 5px 0',
    fontSize: '14px',
    color: '#7f8c8d',
  },
  totalCard: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '10px 0',
    color: '#2c3e50',
  },
  maisItens: {
    fontSize: '12px',
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: '10px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
    maxWidth: '90%',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
  },
  campoModal: {
    marginBottom: '15px'
  },
  inputModal: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  botoesModal: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  botaoCancelar: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  botaoSalvar: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  botaoExcluirModal: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  detalhesTransacao: {
    margin: '15px 0',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    fontSize: '14px'
  },
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  monthInput: {
    padding: '8px 12px',
    borderRadius: '5px',
    border: '1px solid #d9d9d9',
    fontSize: '16px',
    height: '40px',
  },
  currentMonthButton: {
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#2980b9'
    }
  },
  alertaGastos: {
    backgroundColor: '#FFF3E0',
    borderLeft: '4px solid #FFA000',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertaContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  alertaIcon: {
    fontSize: '24px',
  },
  alertaTexto: {
    fontWeight: 'bold',
    margin: 0,
    color: '#E65100',
  },
  alertaSubtexto: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#555',
  },
  alertaFechar: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#555',
    padding: '0 8px',
    ':hover': {
      color: '#000',
    }
  }
};

export default HomePage;