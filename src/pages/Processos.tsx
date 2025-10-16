import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Checkbox,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Avatar,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Download,
  Delete,
  Clear,
  Gavel,
  Archive,
  CheckCircle,
  Warning,
  Schedule,
  AttachMoney,
  Receipt,
  Payment,
  FilterList,
  MoreVert,
  Refresh,
  Share,
  Print,
  Business,
  Person,
  LocationOn,
  CalendarToday,
  AccountBalance,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Processo } from '../types';
import { useProcessos } from '../hooks/useProcessos';
import { useFinanceiro } from '../hooks/useFinanceiro';
import toast from 'react-hot-toast';
import CadastroProcesso from '../components/CadastroProcesso';
import ModalBuscaProcesso from '../components/ModalBuscaProcesso';
import ModalDetalhesProcesso from '../components/ModalDetalhesProcesso';
import { DatabaseService } from '../services/DatabaseService';

const Processos: React.FC = () => {
  const { processos, loading, error, filtrarProcessos, excluirProcesso, atualizarProcesso } = useProcessos();
  const { buscarTodosFinanceiros } = useFinanceiro();
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroTribunal, setFiltroTribunal] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [modalBuscaAberto, setModalBuscaAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [processoSelecionado, setProcessoSelecionado] = useState<Processo | null>(null);
  const [processosFiltrados, setProcessosFiltrados] = useState<Processo[]>([]);
  const [processosSelecionados, setProcessosSelecionados] = useState<string[]>([]);
  const [dialogConfirmacao, setDialogConfirmacao] = useState(false);
  const [dadosFinanceiros, setDadosFinanceiros] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    carregarDadosFinanceiros();
  }, []);

  const carregarDadosFinanceiros = async () => {
    try {
      const financeiros = await buscarTodosFinanceiros();
      setDadosFinanceiros(financeiros);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success';
      case 'arquivado': return 'default';
      case 'suspenso': return 'warning';
      case 'concluido': return 'info';
      default: return 'default';
    }
  };

  const getTipoColor = (tipo: string): "error" | "default" | "success" | "warning" | "info" | "primary" | "secondary" => {
    return 'default'; // Removendo cores dos tipos
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'arquivado': return 'Arquivado';
      case 'suspenso': return 'Suspenso';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'civel': return 'Cível';
      case 'criminal': return 'Criminal';
      case 'trabalhista': return 'Trabalhista';
      case 'tributario': return 'Tributário';
      case 'administrativo': return 'Administrativo';
      default: return tipo;
    }
  };

  const getFinanceiroProcesso = (processoId: string) => {
    return dadosFinanceiros.find(f => f.processoId === processoId);
  };

  const getTribunaisUnicos = () => {
    const tribunais = Array.from(new Set(processos.map(p => p.tribunal)));
    return tribunais.sort();
  };

  // Aplicar filtros
  useEffect(() => {
    const filtrados = processos.filter(processo => {
      const matchBusca = !filtroBusca || 
        processo.numero.toLowerCase().includes(filtroBusca.toLowerCase()) ||
        processo.assunto.toLowerCase().includes(filtroBusca.toLowerCase()) ||
        processo.cliente.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
        processo.cliente.cpfCnpj.toLowerCase().includes(filtroBusca.toLowerCase());
      
      const matchTipo = !filtroTipo || processo.tipo === filtroTipo;
      const matchStatus = !filtroStatus || processo.status === filtroStatus;
      const matchTribunal = !filtroTribunal || processo.tribunal === filtroTribunal;
      
      return matchBusca && matchTipo && matchStatus && matchTribunal;
    });
    
    setProcessosFiltrados(filtrados);
  }, [processos, filtroBusca, filtroTipo, filtroStatus, filtroTribunal]);

  const handleSelecionarTodos = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setProcessosSelecionados(processosFiltrados.map(p => p.id));
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
    setDialogConfirmacao(true);
  };

  const handleArquivarProcesso = async (processoId: string) => {
    try {
      await atualizarProcesso(processoId, { status: 'arquivado' });
      toast.success('Processo arquivado com sucesso!');
    } catch (error) {
      toast.error('Erro ao arquivar processo');
      console.error('Erro ao arquivar processo:', error);
    }
  };

  const confirmarExclusao = async () => {
    try {
      for (const id of processosSelecionados) {
        await excluirProcesso(id);
      }
      setProcessosSelecionados([]);
      setDialogConfirmacao(false);
    } catch (error) {
      console.error('Erro ao excluir processos:', error);
    }
  };

  const handleArquivarSelecionados = async () => {
    try {
      // Implementar arquivamento
      console.log('Arquivando processos:', processosSelecionados);
      setProcessosSelecionados([]);
    } catch (error) {
      console.error('Erro ao arquivar processos:', error);
    }
  };

  const handleExportarProcessos = () => {
    const dadosParaExportar = processosFiltrados.map(processo => {
      const financeiro = getFinanceiroProcesso(processo.id);
      return {
        numero: processo.numero,
        tipo: getTipoLabel(processo.tipo),
        status: getStatusLabel(processo.status),
        assunto: processo.assunto,
        cliente: processo.cliente.nome,
        cpfCnpj: processo.cliente.cpfCnpj,
        tribunal: processo.tribunal,
        vara: processo.vara,
        advogado: processo.advogadoResponsavel,
        dataDistribuicao: processo.dataDistribuicao.toLocaleDateString('pt-BR'),
        dataUltimaMovimentacao: processo.dataUltimaMovimentacao.toLocaleDateString('pt-BR'),
        valorCausa: processo.valorCausa || 0,
        totalHonorarios: financeiro?.honorarios.reduce((sum: number, h: any) => sum + h.valor, 0) || 0,
        totalDespesas: financeiro?.despesas.reduce((sum: number, d: any) => sum + d.valor, 0) || 0,
        totalRecebido: financeiro?.pagamentos.reduce((sum: number, p: any) => sum + p.valor, 0) || 0,
        saldoPendente: financeiro?.saldoReceber || 0,
      };
    });

    const csvContent = [
      'Número,Tipo,Status,Assunto,Cliente,CPF/CNPJ,Tribunal,Vara,Advogado,Data Distribuição,Última Movimentação,Valor Causa,Honorários,Despesas,Recebido,Saldo Pendente',
      ...dadosParaExportar.map(row => 
        `"${row.numero}","${row.tipo}","${row.status}","${row.assunto}","${row.cliente}","${row.cpfCnpj}","${row.tribunal}","${row.vara}","${row.advogado}","${row.dataDistribuicao}","${row.dataUltimaMovimentacao}","${row.valorCausa}","${row.totalHonorarios}","${row.totalDespesas}","${row.totalRecebido}","${row.saldoPendente}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `processos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLimparProcessosFicticios = () => {
    if (window.confirm('Tem certeza que deseja remover todos os processos fictícios? Esta ação não pode ser desfeita.')) {
      DatabaseService.limparProcessosFicticios();
      window.location.reload();
    }
  };

  const handleAbrirModalBusca = () => {
    setModalBuscaAberto(true);
  };

  const handleFecharModalBusca = () => {
    setModalBuscaAberto(false);
  };

  const handleProcessoEncontrado = (processo: Processo) => {
    console.log('Processo encontrado e criado:', processo);
    setProcessosFiltrados(prev => [processo, ...prev]);
  };

  const handleVerDetalhes = (processo: Processo) => {
    setProcessoSelecionado(processo);
    setModalDetalhesAberto(true);
  };

  const handleFecharModalDetalhes = () => {
    setModalDetalhesAberto(false);
    setProcessoSelecionado(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Gavel sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Gestão de Processos
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {processosFiltrados.length} de {processos.length} processos
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            Atualizar
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportarProcessos}
            disabled={loading || processosFiltrados.length === 0}
          >
            Exportar CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            disabled={loading}
          >
            Imprimir
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
                <Gavel sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total de Processos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {processos.length}
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
                <CheckCircle sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Processos Ativos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {processos.filter(p => p.status === 'ativo').length}
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
                <Archive sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Arquivados
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {processos.filter(p => p.status === 'arquivado').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', color: '#1e3a8a' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Valor Total
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    R$ {processos.reduce((sum, p) => sum + (p.valorCausa || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
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
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtros e Ações
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Buscar por número, assunto ou cliente..."
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="civel">Cível</MenuItem>
                  <MenuItem value="criminal">Criminal</MenuItem>
                  <MenuItem value="trabalhista">Trabalhista</MenuItem>
                  <MenuItem value="tributario">Tributário</MenuItem>
                  <MenuItem value="administrativo">Administrativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="arquivado">Arquivado</MenuItem>
                  <MenuItem value="suspenso">Suspenso</MenuItem>
                  <MenuItem value="concluido">Concluído</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tribunal</InputLabel>
                <Select
                  value={filtroTribunal}
                  onChange={(e) => setFiltroTribunal(e.target.value)}
                  label="Tribunal"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {getTribunaisUnicos().map(tribunal => (
                    <MenuItem key={tribunal} value={tribunal}>{tribunal}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAbrirModalBusca}
                  disabled={loading}
                  size="small"
                  sx={{ 
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                    }
                  }}
                >
                  Novo Processo
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<Archive />}
              onClick={handleArquivarSelecionados}
              disabled={processosSelecionados.length === 0}
              color="warning"
              size="small"
            >
              Arquivar ({processosSelecionados.length})
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
            <Button
              variant="outlined"
              startIcon={<Share />}
              disabled={processosSelecionados.length === 0}
              size="small"
            >
              Compartilhar ({processosSelecionados.length})
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabela de Processos */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={processosSelecionados.length > 0 && processosSelecionados.length < processosFiltrados.length}
                    checked={processosFiltrados.length > 0 && processosSelecionados.length === processosFiltrados.length}
                    onChange={handleSelecionarTodos}
                  />
                </TableCell>
                <TableCell>Processo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assunto</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Tribunal</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Financeiro</TableCell>
                <TableCell>Última Mov.</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Carregando processos...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : processosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Nenhum processo encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                processosFiltrados.map((processo) => {
                  const financeiro = getFinanceiroProcesso(processo.id);
                  return (
                    <TableRow key={processo.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={processosSelecionados.includes(processo.id)}
                          onChange={() => handleSelecionarProcesso(processo.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {processo.numero}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {processo.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getTipoLabel(processo.tipo)} 
                          color={getTipoColor(processo.tipo)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(processo.status)} 
                          color={getStatusColor(processo.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {processo.assunto}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 'bold' }}>
                            {processo.cliente.nome}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {processo.cliente.cpfCnpj}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <AccountBalance sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {processo.tribunal}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {processo.vara}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          R$ {(processo.valorCausa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {financeiro ? (
                          <Box>
                            <Typography variant="caption" color="primary.main" display="block">
                              H: R$ {financeiro.honorarios.reduce((sum: number, h: any) => sum + h.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </Typography>
                            <Typography variant="caption" color="warning.main" display="block">
                              D: R$ {financeiro.despesas.reduce((sum: number, d: any) => sum + d.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </Typography>
                            <Typography variant="caption" color={financeiro.saldoReceber > 0 ? "error.main" : "success.main"} display="block">
                              S: R$ {financeiro.saldoReceber.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            Sem dados
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          {processo.dataUltimaMovimentacao.toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {processo.dataUltimaMovimentacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Visualizar Detalhes">
                            <IconButton
                              size="small"
                              onClick={() => handleVerDetalhes(processo)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/processos/${processo.id}`)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Financeiro">
                            <IconButton
                              size="small"
                              onClick={() => navigate('/financeiro')}
                            >
                              <AttachMoney />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Arquivar Processo">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleArquivarProcesso(processo.id)}
                            >
                              <Archive />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mais Opções">
                            <IconButton size="small">
                              <MoreVert />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog de Confirmação */}
      <Dialog open={dialogConfirmacao} onClose={() => setDialogConfirmacao(false)}>
        <DialogTitle>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir {processosSelecionados.length} processo(s) selecionado(s)? 
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogConfirmacao(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmarExclusao} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Componentes */}
      <CadastroProcesso
        open={dialogAberto}
        onClose={() => setDialogAberto(false)}
        onSuccess={() => {
          setDialogAberto(false);
          window.location.reload();
        }}
      />
      <ModalBuscaProcesso
        open={modalBuscaAberto}
        onClose={handleFecharModalBusca}
        onProcessoCriado={handleProcessoEncontrado}
      />
      <ModalDetalhesProcesso
        open={modalDetalhesAberto}
        onClose={handleFecharModalDetalhes}
        processo={processoSelecionado}
      />
    </Box>
  );
};

export default Processos;





