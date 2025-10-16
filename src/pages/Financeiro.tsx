import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Checkbox,
  Tooltip,
  InputAdornment,
  DialogContentText,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  Receipt,
  Payment,
  Visibility,
  Search,
  Clear,
  Check,
  Close,
  MoneyOff,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { FinanceiroProcesso, Honorario, Despesa, Pagamento } from '../types';
import CadastroFinanceiro from '../components/CadastroFinanceiro';
import DetalhesFinanceiro from '../components/DetalhesFinanceiro';
import toast from 'react-hot-toast';

const Financeiro: React.FC = () => {
  const {
    loading,
    error,
    buscarTodosFinanceiros,
    adicionarHonorario,
    adicionarDespesa,
    adicionarPagamento,
    calcularHonorarioPercentual,
    atualizarStatusHonorario,
    atualizarStatusDespesa,
    excluirHonorario,
    excluirDespesa,
    excluirPagamento,
  } = useFinanceiro();

  const [financeiros, setFinanceiros] = useState<FinanceiroProcesso[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [tipoDialog, setTipoDialog] = useState<'honorario' | 'despesa' | 'pagamento'>('honorario');
  const [processoSelecionado, setProcessoSelecionado] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [processoDetalhes, setProcessoDetalhes] = useState<string>('');
  const [processosSelecionados, setProcessosSelecionados] = useState<string[]>([]);
  const [dialogConfirmacao, setDialogConfirmacao] = useState(false);
  const [acaoConfirmacao, setAcaoConfirmacao] = useState<'excluir_honorario' | 'excluir_despesa' | 'excluir_pagamento' | 'excluir' | 'pagar_integral' | 'pagar_parcial' | null>(null);
  const [dialogPagamento, setDialogPagamento] = useState(false);
  const [valorPagamento, setValorPagamento] = useState('');

  useEffect(() => {
    carregarFinanceiros();
  }, []);

  const carregarFinanceiros = async () => {
    try {
      const dados = await buscarTodosFinanceiros();
      setFinanceiros(dados);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quitado': return 'success';
      case 'parcialmente_pago': return 'warning';
      case 'em_aberto': return 'info';
      case 'em_atraso': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'quitado': return 'Quitado';
      case 'parcialmente_pago': return 'Parcialmente Pago';
      case 'em_aberto': return 'Em Aberto';
      case 'em_atraso': return 'Em Atraso';
      default: return status;
    }
  };

  // Aplicar filtros
  const financeirosFiltrados = financeiros.filter(f => {
    const matchStatus = !filtroStatus || f.statusFinanceiro === filtroStatus;
    const matchBusca = !filtroBusca || 
      f.processoId.toLowerCase().includes(filtroBusca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const totalHonorarios = financeiros.reduce((sum, f) => 
    sum + f.honorarios.reduce((s, h) => s + h.valor, 0), 0
  );
  
  const totalDespesas = financeiros.reduce((sum, f) => 
    sum + f.despesas.reduce((s, d) => s + d.valor, 0), 0
  );
  
  const totalRecebido = financeiros.reduce((sum, f) => 
    sum + f.pagamentos.reduce((s, p) => s + p.valor, 0), 0
  );

  const saldoPendente = totalHonorarios + totalDespesas - totalRecebido;

  const handleAbrirDialog = (tipo: 'honorario' | 'despesa' | 'pagamento', processoId: string) => {
    setTipoDialog(tipo);
    setProcessoSelecionado(processoId);
    setDialogAberto(true);
  };

  const handleFecharDialog = () => {
    setDialogAberto(false);
    setProcessoSelecionado('');
  };

  const handleSucesso = () => {
    carregarFinanceiros();
  };

  const handleVisualizarDetalhes = (processoId: string) => {
    setProcessoDetalhes(processoId);
    setDetalhesAberto(true);
  };

  const handleFecharDetalhes = () => {
    setDetalhesAberto(false);
    setProcessoDetalhes('');
  };

  const handleSelecionarTodos = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setProcessosSelecionados(financeirosFiltrados.map(f => f.processoId));
    } else {
      setProcessosSelecionados([]);
    }
  };

  const handleSelecionarProcesso = (processoId: string) => {
    setProcessosSelecionados(prev => 
      prev.includes(processoId) 
        ? prev.filter(id => id !== processoId)
        : [...prev, processoId]
    );
  };

  const handleExcluirSelecionados = () => {
    setAcaoConfirmacao('excluir');
    setDialogConfirmacao(true);
  };

  const handlePagarIntegral = () => {
    setAcaoConfirmacao('pagar_integral');
    setDialogConfirmacao(true);
  };

  const handlePagarParcial = () => {
    setAcaoConfirmacao('pagar_parcial');
    setDialogPagamento(true);
  };

  const handleAbrirConfirmacao = (acao: 'excluir_honorario' | 'excluir_despesa' | 'excluir_pagamento' | 'pagar_integral' | 'pagar_parcial', processoId?: string) => {
    if (processosSelecionados.length === 0 && acao !== 'pagar_parcial' && !processoId) {
      toast.error(`Selecione pelo menos um item para ${acao.replace('_', ' ')}.`);
      return;
    }
    
    // Se foi passado um processoId específico, usar apenas ele
    if (processoId) {
      setProcessosSelecionados([processoId]);
    }
    
    setAcaoConfirmacao(acao);
    if (acao === 'pagar_parcial') {
      setDialogPagamento(true);
    } else {
      setDialogConfirmacao(true);
    }
  };

  const confirmarAcao = async () => {
    if (!acaoConfirmacao) return;

    try {
      if (acaoConfirmacao === 'excluir_honorario') {
        // Excluir honorários dos processos selecionados
        for (const processoId of processosSelecionados) {
          const financeiro = financeiros.find(f => f.processoId === processoId);
          if (financeiro) {
            for (const honorario of financeiro.honorarios) {
              await excluirHonorario(honorario.id);
            }
          }
        }
        toast.success('Honorários excluídos com sucesso!');
      } else if (acaoConfirmacao === 'excluir_despesa') {
        // Excluir despesas dos processos selecionados
        for (const processoId of processosSelecionados) {
          const financeiro = financeiros.find(f => f.processoId === processoId);
          if (financeiro) {
            for (const despesa of financeiro.despesas) {
              await excluirDespesa(despesa.id);
            }
          }
        }
        toast.success('Despesas excluídas com sucesso!');
      } else if (acaoConfirmacao === 'excluir_pagamento') {
        // Excluir pagamentos dos processos selecionados
        for (const processoId of processosSelecionados) {
          const financeiro = financeiros.find(f => f.processoId === processoId);
          if (financeiro) {
            for (const pagamento of financeiro.pagamentos) {
              await excluirPagamento(pagamento.id);
            }
          }
        }
        toast.success('Pagamentos excluídos com sucesso!');
      } else if (acaoConfirmacao === 'excluir') {
        // Excluir processos selecionados
        for (const processoId of processosSelecionados) {
          const financeiro = financeiros.find(f => f.processoId === processoId);
          if (financeiro) {
            // Excluir todos os itens financeiros do processo
            for (const honorario of financeiro.honorarios) {
              await excluirHonorario(honorario.id);
            }
            for (const despesa of financeiro.despesas) {
              await excluirDespesa(despesa.id);
            }
            for (const pagamento of financeiro.pagamentos) {
              await excluirPagamento(pagamento.id);
            }
          }
        }
      } else if (acaoConfirmacao === 'pagar_integral') {
        // Pagar integralmente os processos selecionados
        for (const processoId of processosSelecionados) {
          const financeiro = financeiros.find(f => f.processoId === processoId);
          if (financeiro && financeiro.saldoReceber > 0) {
            await adicionarPagamento(processoId, {
              tipo: 'honorario',
              descricao: 'Pagamento integral realizado',
              valor: financeiro.saldoReceber,
              dataPagamento: new Date(),
              formaPagamento: 'transferencia',
              observacoes: 'Pagamento integral realizado',
            });
          }
        }
      }
      
      setProcessosSelecionados([]);
      setDialogConfirmacao(false);
      setAcaoConfirmacao(null);
      await carregarFinanceiros();
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  const confirmarPagamentoParcial = async () => {
    if (!valorPagamento || parseFloat(valorPagamento) <= 0) return;

    try {
      for (const processoId of processosSelecionados) {
        await adicionarPagamento(processoId, {
          tipo: 'honorario',
          descricao: 'Pagamento parcial realizado',
          valor: parseFloat(valorPagamento),
          dataPagamento: new Date(),
          formaPagamento: 'transferencia',
          observacoes: 'Pagamento parcial realizado',
        });
      }
      
      setProcessosSelecionados([]);
      setDialogPagamento(false);
      setValorPagamento('');
      await carregarFinanceiros();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
    }
  };

  const handleExportarFinanceiro = () => {
    const dadosParaExportar = financeirosFiltrados.map(financeiro => ({
      processo: financeiro.processoId,
      valorCausa: financeiro.valorCausa,
      honorarios: financeiro.honorarios.reduce((sum, h) => sum + h.valor, 0),
      despesas: financeiro.despesas.reduce((sum, d) => sum + d.valor, 0),
      recebido: financeiro.pagamentos.reduce((sum, p) => sum + p.valor, 0),
      saldo: financeiro.saldoReceber,
      status: getStatusLabel(financeiro.statusFinanceiro),
    }));

    const csvContent = [
      'Processo,Valor Causa,Honorários,Despesas,Recebido,Saldo,Status',
      ...dadosParaExportar.map(row => 
        `"${row.processo}","${row.valorCausa}","${row.honorarios}","${row.despesas}","${row.recebido}","${row.saldo}","${row.status}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <AccountBalanceWallet sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4">
              Módulo Financeiro
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Controle de honorários, despesas e pagamentos
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={handleExportarFinanceiro}
            disabled={loading || financeirosFiltrados.length === 0}
          >
            Exportar CSV
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Cards de Resumo */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #64748b 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Honorários
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    R$ {totalHonorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Receipt sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Despesas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Payment sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Recebido
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: saldoPendente > 0 
              ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' 
              : 'linear-gradient(135deg, #059669 0%, #10b981 100%)', 
            color: 'white' 
          }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalanceWallet sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Saldo Pendente
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    R$ {saldoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros e Ações */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Buscar por processo..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Financeiro</InputLabel>
                <Select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  label="Status Financeiro"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="em_aberto">Em Aberto</MenuItem>
                  <MenuItem value="parcialmente_pago">Parcialmente Pago</MenuItem>
                  <MenuItem value="quitado">Quitado</MenuItem>
                  <MenuItem value="em_atraso">Em Atraso</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleAbrirDialog('honorario', '1')}
                  size="small"
                >
                  Honorário
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleAbrirDialog('despesa', '1')}
                  size="small"
                >
                  Despesa
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleAbrirDialog('pagamento', '1')}
                  size="small"
                >
                  Pagamento
                </Button>
                <Divider orientation="vertical" flexItem />
                <Button
                  variant="outlined"
                  startIcon={<Check />}
                  onClick={handlePagarIntegral}
                  disabled={processosSelecionados.length === 0}
                  color="success"
                  size="small"
                >
                  Pagar Integral ({processosSelecionados.length})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MoneyOff />}
                  onClick={handlePagarParcial}
                  disabled={processosSelecionados.length === 0}
                  color="warning"
                  size="small"
                >
                  Pagar Parcial ({processosSelecionados.length})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Delete />}
                  onClick={handleExcluirSelecionados}
                  disabled={processosSelecionados.length === 0}
                  color="error"
                  size="small"
                >
                  Excluir ({processosSelecionados.length})
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Processos Financeiros */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={processosSelecionados.length > 0 && processosSelecionados.length < financeirosFiltrados.length}
                    checked={financeirosFiltrados.length > 0 && processosSelecionados.length === financeirosFiltrados.length}
                    onChange={handleSelecionarTodos}
                  />
                </TableCell>
                <TableCell>Processo</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Valor da Causa</TableCell>
                <TableCell>Honorários</TableCell>
                <TableCell>Despesas</TableCell>
                <TableCell>Recebido</TableCell>
                <TableCell>Saldo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Carregando dados financeiros...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : financeirosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Nenhum processo financeiro encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                financeirosFiltrados.map((financeiro) => (
                  <TableRow key={financeiro.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={processosSelecionados.includes(financeiro.processoId)}
                        onChange={() => handleSelecionarProcesso(financeiro.processoId)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                        {financeiro.processoId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Cliente {financeiro.processoId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        R$ {financeiro.valorCausa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary.main" fontWeight="medium">
                        R$ {financeiro.honorarios.reduce((sum, h) => sum + h.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="warning.main" fontWeight="medium">
                        R$ {financeiro.despesas.reduce((sum, d) => sum + d.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        R$ {financeiro.pagamentos.reduce((sum, p) => sum + p.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={financeiro.saldoReceber > 0 ? "error.main" : "success.main"}
                        fontWeight="bold"
                      >
                        R$ {financeiro.saldoReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(financeiro.statusFinanceiro)}
                        color={getStatusColor(financeiro.statusFinanceiro) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Visualizar Detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleVisualizarDetalhes(financeiro.processoId)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir Honorários">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              handleAbrirConfirmacao('excluir_honorario', financeiro.processoId);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Adicionar Honorário">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrirDialog('honorario', financeiro.processoId)}
                          >
                            <AttachMoney />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Adicionar Despesa">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrirDialog('despesa', financeiro.processoId)}
                          >
                            <Receipt />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Registrar Pagamento">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrirDialog('pagamento', financeiro.processoId)}
                          >
                            <Payment />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog para Adicionar Itens Financeiros */}
      <CadastroFinanceiro
        open={dialogAberto}
        onClose={handleFecharDialog}
        tipo={tipoDialog}
        processoId={processoSelecionado}
        onSuccess={handleSucesso}
      />

      {/* Dialog para Visualizar Detalhes */}
      <DetalhesFinanceiro
        open={detalhesAberto}
        onClose={handleFecharDetalhes}
        processoId={processoDetalhes}
      />

      {/* Dialog de Confirmação */}
      <Dialog open={dialogConfirmacao} onClose={() => setDialogConfirmacao(false)}>
        <DialogTitle>
          Confirmar Ação
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {acaoConfirmacao === 'excluir' 
              ? `Tem certeza que deseja excluir os dados financeiros de ${processosSelecionados.length} processo(s) selecionado(s)? Esta ação não pode ser desfeita.`
              : `Tem certeza que deseja registrar pagamento integral para ${processosSelecionados.length} processo(s) selecionado(s)?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogConfirmacao(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmarAcao}
            color={acaoConfirmacao === 'excluir' ? 'error' : 'success'}
            variant="contained"
          >
            {acaoConfirmacao === 'excluir' ? 'Excluir' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Pagamento Parcial */}
      <Dialog open={dialogPagamento} onClose={() => setDialogPagamento(false)}>
        <DialogTitle>
          Pagamento Parcial
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Digite o valor do pagamento parcial para {processosSelecionados.length} processo(s) selecionado(s):
          </DialogContentText>
          <TextField
            fullWidth
            label="Valor do Pagamento"
            type="number"
            value={valorPagamento}
            onChange={(e) => setValorPagamento(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogPagamento(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmarPagamentoParcial}
            color="success"
            variant="contained"
            disabled={!valorPagamento || parseFloat(valorPagamento) <= 0}
          >
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Financeiro;






  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Checkbox,
  Tooltip,
  InputAdornment,
  DialogContentText,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  Receipt,
  Payment,
  Visibility,
  Search,
  Clear,
  Check,
  Close,
  MoneyOff,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { FinanceiroProcesso, Honorario, Despesa, Pagamento } from '../types';
import CadastroFinanceiro from '../components/CadastroFinanceiro';
import DetalhesFinanceiro from '../components/DetalhesFinanceiro';
import toast from 'react-hot-toast';

const Financeiro: React.FC = () => {
  const {
    loading,
    error,
    buscarTodosFinanceiros,
    adicionarHonorario,
    adicionarDespesa,
    adicionarPagamento,
    calcularHonorarioPercentual,
    atualizarStatusHonorario,
    atualizarStatusDespesa,
    excluirHonorario,
    excluirDespesa,
    excluirPagamento,
  } = useFinanceiro();

  const [financeiros, setFinanceiros] = useState<FinanceiroProcesso[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [tipoDialog, setTipoDialog] = useState<'honorario' | 'despesa' | 'pagamento'>('honorario');
  const [processoSelecionado, setProcessoSelecionado] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [processoDetalhes, setProcessoDetalhes] = useState<string>('');
  const [processosSelecionados, setProcessosSelecionados] = useState<string[]>([]);
  const [dialogConfirmacao, setDialogConfirmacao] = useState(false);
  const [acaoConfirmacao, setAcaoConfirmacao] = useState<'excluir_honorario' | 'excluir_despesa' | 'excluir_pagamento' | 'excluir' | 'pagar_integral' | 'pagar_parcial' | null>(null);
  const [dialogPagamento, setDialogPagamento] = useState(false);
  const [valorPagamento, setValorPagamento] = useState('');

  useEffect(() => {
    carregarFinanceiros();
  }, []);

  const carregarFinanceiros = async () => {
    try {
      const dados = await buscarTodosFinanceiros();
      setFinanceiros(dados);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quitado': return 'success';
      case 'parcialmente_pago': return 'warning';
      case 'em_aberto': return 'info';
      case 'em_atraso': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'quitado': return 'Quitado';
      case 'parcialmente_pago': return 'Parcialmente Pago';
      case 'em_aberto': return 'Em Aberto';
      case 'em_atraso': return 'Em Atraso';
      default: return status;
    }
  };

  // Aplicar filtros
  const financeirosFiltrados = financeiros.filter(f => {
    const matchStatus = !filtroStatus || f.statusFinanceiro === filtroStatus;
    const matchBusca = !filtroBusca || 
      f.processoId.toLowerCase().includes(filtroBusca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const totalHonorarios = financeiros.reduce((sum, f) => 
    sum + f.honorarios.reduce((s, h) => s + h.valor, 0), 0
  );
  
  const totalDespesas = financeiros.reduce((sum, f) => 
    sum + f.despesas.reduce((s, d) => s + d.valor, 0), 0
  );
  
  const totalRecebido = financeiros.reduce((sum, f) => 
    sum + f.pagamentos.reduce((s, p) => s + p.valor, 0), 0
  );

  const saldoPendente = totalHonorarios + totalDespesas - totalRecebido;

  const handleAbrirDialog = (tipo: 'honorario' | 'despesa' | 'pagamento', processoId: string) => {
    setTipoDialog(tipo);
    setProcessoSelecionado(processoId);
    setDialogAberto(true);
  };

  const handleFecharDialog = () => {
    setDialogAberto(false);
    setProcessoSelecionado('');
  };

  const handleSucesso = () => {
    carregarFinanceiros();
  };

  const handleVisualizarDetalhes = (processoId: string) => {
    setProcessoDetalhes(processoId);
    setDetalhesAberto(true);
  };

  const handleFecharDetalhes = () => {
    setDetalhesAberto(false);
    setProcessoDetalhes('');
  };

  const handleSelecionarTodos = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setProcessosSelecionados(financeirosFiltrados.map(f => f.processoId));
    } else {
      setProcessosSelecionados([]);
    }
  };

  const handleSelecionarProcesso = (processoId: string) => {
    setProcessosSelecionados(prev => 
      prev.includes(processoId) 
        ? prev.filter(id => id !== processoId)
        : [...prev, processoId]
    );
  };

  const handleExcluirSelecionados = () => {
    setAcaoConfirmacao('excluir');
    setDialogConfirmacao(true);
  };

  const handlePagarIntegral = () => {
    setAcaoConfirmacao('pagar_integral');
    setDialogConfirmacao(true);
  };

  const handlePagarParcial = () => {
    setAcaoConfirmacao('pagar_parcial');
    setDialogPagamento(true);
  };

  const handleAbrirConfirmacao = (acao: 'excluir_honorario' | 'excluir_despesa' | 'excluir_pagamento' | 'pagar_integral' | 'pagar_parcial', processoId?: string) => {
    if (processosSelecionados.length === 0 && acao !== 'pagar_parcial' && !processoId) {
      toast.error(`Selecione pelo menos um item para ${acao.replace('_', ' ')}.`);
      return;
    }
    
    // Se foi passado um processoId específico, usar apenas ele
    if (processoId) {
      setProcessosSelecionados([processoId]);
    }
    
    setAcaoConfirmacao(acao);
    if (acao === 'pagar_parcial') {
      setDialogPagamento(true);
    } else {
      setDialogConfirmacao(true);
    }
  };

  const confirmarAcao = async () => {
    if (!acaoConfirmacao) return;

    try {
      if (acaoConfirmacao === 'excluir_honorario') {
        // Excluir honorários dos processos selecionados
        for (const processoId of processosSelecionados) {
          const financeiro = financeiros.find(f => f.processoId === processoId);
          if (financeiro) {
            for (const honorario of financeiro.honorarios) {
              await excluirHonorario(honorario.id);
            }
          }
        }
        toast.success('Honorários excluídos com sucesso!');
      } else if (acaoConfirmacao === 'excluir_despesa') {
        // Excluir despesas dos processos selecionados
        for (const processoId of processosSelecionados) {
          const financeiro = financeiros.find(f => f.processoId === processoId);
          if (financeiro) {
            for (const despesa of financeiro.despesas) {
              await excluirDespesa(despesa.id);
            }
          }
        }
        toast.success('Despesas excluídas com sucesso!');
      } else if (acaoConfirmacao === 'excluir_pagamento') {
        // Excluir pagamentos dos processos selecionados
        for (const processoId of processosSelecionados) {
          const financeiro = financeiros.find(f => f.processoId === processoId);
          if (financeiro) {
            for (const pagamento of financeiro.pagamentos) {
              await excluirPagamento(pagamento.id);
            }
          }
        }
        toast.success('Pagamentos excluídos com sucesso!');
      } else if (acaoConfirmacao === 'excluir') {
        // Excluir processos selecionados
        for (const processoId of processosSelecionados) {
          const financeiro = financeiros.find(f => f.processoId === processoId);
          if (financeiro) {
            // Excluir todos os itens financeiros do processo
            for (const honorario of financeiro.honorarios) {
              await excluirHonorario(honorario.id);
            }
            for (const despesa of financeiro.despesas) {
              await excluirDespesa(despesa.id);
            }
            for (const pagamento of financeiro.pagamentos) {
              await excluirPagamento(pagamento.id);
            }
          }
        }
      } else if (acaoConfirmacao === 'pagar_integral') {
        // Pagar integralmente os processos selecionados
        for (const processoId of processosSelecionados) {
          const financeiro = financeiros.find(f => f.processoId === processoId);
          if (financeiro && financeiro.saldoReceber > 0) {
            await adicionarPagamento(processoId, {
              tipo: 'honorario',
              descricao: 'Pagamento integral realizado',
              valor: financeiro.saldoReceber,
              dataPagamento: new Date(),
              formaPagamento: 'transferencia',
              observacoes: 'Pagamento integral realizado',
            });
          }
        }
      }
      
      setProcessosSelecionados([]);
      setDialogConfirmacao(false);
      setAcaoConfirmacao(null);
      await carregarFinanceiros();
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  const confirmarPagamentoParcial = async () => {
    if (!valorPagamento || parseFloat(valorPagamento) <= 0) return;

    try {
      for (const processoId of processosSelecionados) {
        await adicionarPagamento(processoId, {
          tipo: 'honorario',
          descricao: 'Pagamento parcial realizado',
          valor: parseFloat(valorPagamento),
          dataPagamento: new Date(),
          formaPagamento: 'transferencia',
          observacoes: 'Pagamento parcial realizado',
        });
      }
      
      setProcessosSelecionados([]);
      setDialogPagamento(false);
      setValorPagamento('');
      await carregarFinanceiros();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
    }
  };

  const handleExportarFinanceiro = () => {
    const dadosParaExportar = financeirosFiltrados.map(financeiro => ({
      processo: financeiro.processoId,
      valorCausa: financeiro.valorCausa,
      honorarios: financeiro.honorarios.reduce((sum, h) => sum + h.valor, 0),
      despesas: financeiro.despesas.reduce((sum, d) => sum + d.valor, 0),
      recebido: financeiro.pagamentos.reduce((sum, p) => sum + p.valor, 0),
      saldo: financeiro.saldoReceber,
      status: getStatusLabel(financeiro.statusFinanceiro),
    }));

    const csvContent = [
      'Processo,Valor Causa,Honorários,Despesas,Recebido,Saldo,Status',
      ...dadosParaExportar.map(row => 
        `"${row.processo}","${row.valorCausa}","${row.honorarios}","${row.despesas}","${row.recebido}","${row.saldo}","${row.status}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <AccountBalanceWallet sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4">
              Módulo Financeiro
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Controle de honorários, despesas e pagamentos
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={handleExportarFinanceiro}
            disabled={loading || financeirosFiltrados.length === 0}
          >
            Exportar CSV
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Cards de Resumo */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #64748b 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Honorários
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    R$ {totalHonorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Receipt sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Despesas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Payment sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Recebido
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: saldoPendente > 0 
              ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' 
              : 'linear-gradient(135deg, #059669 0%, #10b981 100%)', 
            color: 'white' 
          }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalanceWallet sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Saldo Pendente
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    R$ {saldoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros e Ações */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Buscar por processo..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Financeiro</InputLabel>
                <Select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  label="Status Financeiro"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="em_aberto">Em Aberto</MenuItem>
                  <MenuItem value="parcialmente_pago">Parcialmente Pago</MenuItem>
                  <MenuItem value="quitado">Quitado</MenuItem>
                  <MenuItem value="em_atraso">Em Atraso</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleAbrirDialog('honorario', '1')}
                  size="small"
                >
                  Honorário
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleAbrirDialog('despesa', '1')}
                  size="small"
                >
                  Despesa
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleAbrirDialog('pagamento', '1')}
                  size="small"
                >
                  Pagamento
                </Button>
                <Divider orientation="vertical" flexItem />
                <Button
                  variant="outlined"
                  startIcon={<Check />}
                  onClick={handlePagarIntegral}
                  disabled={processosSelecionados.length === 0}
                  color="success"
                  size="small"
                >
                  Pagar Integral ({processosSelecionados.length})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MoneyOff />}
                  onClick={handlePagarParcial}
                  disabled={processosSelecionados.length === 0}
                  color="warning"
                  size="small"
                >
                  Pagar Parcial ({processosSelecionados.length})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Delete />}
                  onClick={handleExcluirSelecionados}
                  disabled={processosSelecionados.length === 0}
                  color="error"
                  size="small"
                >
                  Excluir ({processosSelecionados.length})
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Processos Financeiros */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={processosSelecionados.length > 0 && processosSelecionados.length < financeirosFiltrados.length}
                    checked={financeirosFiltrados.length > 0 && processosSelecionados.length === financeirosFiltrados.length}
                    onChange={handleSelecionarTodos}
                  />
                </TableCell>
                <TableCell>Processo</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Valor da Causa</TableCell>
                <TableCell>Honorários</TableCell>
                <TableCell>Despesas</TableCell>
                <TableCell>Recebido</TableCell>
                <TableCell>Saldo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Carregando dados financeiros...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : financeirosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Nenhum processo financeiro encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                financeirosFiltrados.map((financeiro) => (
                  <TableRow key={financeiro.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={processosSelecionados.includes(financeiro.processoId)}
                        onChange={() => handleSelecionarProcesso(financeiro.processoId)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                        {financeiro.processoId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Cliente {financeiro.processoId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        R$ {financeiro.valorCausa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary.main" fontWeight="medium">
                        R$ {financeiro.honorarios.reduce((sum, h) => sum + h.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="warning.main" fontWeight="medium">
                        R$ {financeiro.despesas.reduce((sum, d) => sum + d.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        R$ {financeiro.pagamentos.reduce((sum, p) => sum + p.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={financeiro.saldoReceber > 0 ? "error.main" : "success.main"}
                        fontWeight="bold"
                      >
                        R$ {financeiro.saldoReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(financeiro.statusFinanceiro)}
                        color={getStatusColor(financeiro.statusFinanceiro) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Visualizar Detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleVisualizarDetalhes(financeiro.processoId)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir Honorários">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              handleAbrirConfirmacao('excluir_honorario', financeiro.processoId);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Adicionar Honorário">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrirDialog('honorario', financeiro.processoId)}
                          >
                            <AttachMoney />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Adicionar Despesa">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrirDialog('despesa', financeiro.processoId)}
                          >
                            <Receipt />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Registrar Pagamento">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrirDialog('pagamento', financeiro.processoId)}
                          >
                            <Payment />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog para Adicionar Itens Financeiros */}
      <CadastroFinanceiro
        open={dialogAberto}
        onClose={handleFecharDialog}
        tipo={tipoDialog}
        processoId={processoSelecionado}
        onSuccess={handleSucesso}
      />

      {/* Dialog para Visualizar Detalhes */}
      <DetalhesFinanceiro
        open={detalhesAberto}
        onClose={handleFecharDetalhes}
        processoId={processoDetalhes}
      />

      {/* Dialog de Confirmação */}
      <Dialog open={dialogConfirmacao} onClose={() => setDialogConfirmacao(false)}>
        <DialogTitle>
          Confirmar Ação
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {acaoConfirmacao === 'excluir' 
              ? `Tem certeza que deseja excluir os dados financeiros de ${processosSelecionados.length} processo(s) selecionado(s)? Esta ação não pode ser desfeita.`
              : `Tem certeza que deseja registrar pagamento integral para ${processosSelecionados.length} processo(s) selecionado(s)?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogConfirmacao(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmarAcao}
            color={acaoConfirmacao === 'excluir' ? 'error' : 'success'}
            variant="contained"
          >
            {acaoConfirmacao === 'excluir' ? 'Excluir' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Pagamento Parcial */}
      <Dialog open={dialogPagamento} onClose={() => setDialogPagamento(false)}>
        <DialogTitle>
          Pagamento Parcial
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Digite o valor do pagamento parcial para {processosSelecionados.length} processo(s) selecionado(s):
          </DialogContentText>
          <TextField
            fullWidth
            label="Valor do Pagamento"
            type="number"
            value={valorPagamento}
            onChange={(e) => setValorPagamento(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogPagamento(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmarPagamentoParcial}
            color="success"
            variant="contained"
            disabled={!valorPagamento || parseFloat(valorPagamento) <= 0}
          >
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Financeiro;



