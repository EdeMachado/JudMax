import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Download,
  Assessment,
  PictureAsPdf,
  TableChart,
  BarChart,
  PieChart,
  TrendingUp,
  Visibility,
  Print,
  Share,
  FilterList,
  Clear,
} from '@mui/icons-material';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { useProcessos } from '../hooks/useProcessos';
import { useFinanceiro } from '../hooks/useFinanceiro';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const Relatorios: React.FC = () => {
  const { processos, loading: loadingProcessos } = useProcessos();
  const { buscarTodosFinanceiros, loading: loadingFinanceiro } = useFinanceiro();
  
  const [tipoRelatorio, setTipoRelatorio] = useState('processos_por_status');
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  const [filtrosSelecionados, setFiltrosSelecionados] = useState<string[]>([]);
  const [dadosFinanceiros, setDadosFinanceiros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogExportacao, setDialogExportacao] = useState(false);
  const [formatoExportacao, setFormatoExportacao] = useState('pdf');

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

  const opcoesFiltros = [
    { id: 'status_ativo', label: 'Status: Ativo' },
    { id: 'status_arquivado', label: 'Status: Arquivado' },
    { id: 'tipo_civel', label: 'Tipo: Cível' },
    { id: 'tipo_criminal', label: 'Tipo: Criminal' },
    { id: 'tipo_trabalhista', label: 'Tipo: Trabalhista' },
    { id: 'tribunal_tjsp', label: 'Tribunal: TJSP' },
    { id: 'tribunal_trt', label: 'Tribunal: TRT' },
    { id: 'com_honorarios', label: 'Com Honorários' },
    { id: 'em_atraso', label: 'Em Atraso' },
  ];

  const handleFiltroChange = (filtroId: string) => {
    setFiltrosSelecionados(prev => 
      prev.includes(filtroId) 
        ? prev.filter(id => id !== filtroId)
        : [...prev, filtroId]
    );
  };

  const aplicarFiltros = (dados: any[]) => {
    return dados.filter(item => {
      return filtrosSelecionados.every(filtro => {
        switch (filtro) {
          case 'status_ativo':
            return item.status === 'ativo';
          case 'status_arquivado':
            return item.status === 'arquivado';
          case 'tipo_civel':
            return item.tipo === 'civel';
          case 'tipo_criminal':
            return item.tipo === 'criminal';
          case 'tipo_trabalhista':
            return item.tipo === 'trabalhista';
          case 'tribunal_tjsp':
            return item.tribunal === 'TJSP';
          case 'tribunal_trt':
            return item.tribunal?.includes('TRT');
          case 'com_honorarios':
            return dadosFinanceiros.some(f => f.processoId === item.id && f.honorarios.length > 0);
          case 'em_atraso':
            return dadosFinanceiros.some(f => f.processoId === item.id && f.statusFinanceiro === 'em_atraso');
          default:
            return true;
        }
      });
    });
  };

  const dadosProcessosPorStatus = () => {
    const dadosFiltrados = aplicarFiltros(processos);
    const statusCount = dadosFiltrados.reduce((acc, processo) => {
      acc[processo.status] = (acc[processo.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, quantidade]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      quantidade: quantidade as number
    }));
  };

  const dadosProcessosPorTipo = () => {
    const dadosFiltrados = aplicarFiltros(processos);
    const tipoCount = dadosFiltrados.reduce((acc, processo) => {
      acc[processo.tipo] = (acc[processo.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tipoCount).map(([tipo, quantidade]) => ({
      tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      quantidade: quantidade as number
    }));
  };

  const dadosFinanceirosResumo = () => {
    const totalHonorarios = dadosFinanceiros.reduce((sum, f) => 
      sum + f.honorarios.reduce((s: number, h: any) => s + h.valor, 0), 0
    );
    
    const totalDespesas = dadosFinanceiros.reduce((sum, f) => 
      sum + f.despesas.reduce((s: number, d: any) => s + d.valor, 0), 0
    );
    
    const totalRecebido = dadosFinanceiros.reduce((sum, f) => 
      sum + f.pagamentos.reduce((s: number, p: any) => s + p.valor, 0), 0
    );

    return [
      { categoria: 'Honorários', valor: totalHonorarios, cor: '#0088FE' },
      { categoria: 'Despesas', valor: totalDespesas, cor: '#FF8042' },
      { categoria: 'Recebido', valor: totalRecebido, cor: '#00C49F' },
    ];
  };

  const dadosPerformanceTribunais = () => {
    const dadosFiltrados = aplicarFiltros(processos);
    const tribunalCount = dadosFiltrados.reduce((acc, processo) => {
      acc[processo.tribunal] = (acc[processo.tribunal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tribunalCount).map(([tribunal, quantidade]) => ({
      tribunal,
      quantidade
    }));
  };

  const handleGerarRelatorio = async () => {
    setLoading(true);
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Relatório gerado:', { tipoRelatorio, periodoInicio, periodoFim, filtrosSelecionados });
    } finally {
      setLoading(false);
    }
  };

  const handleExportarRelatorio = () => {
    setDialogExportacao(true);
  };

  const confirmarExportacao = () => {
    console.log('Exportando relatório em formato:', formatoExportacao);
    setDialogExportacao(false);
    
    // Simular exportação
    const dados = {
      tipoRelatorio,
      periodoInicio,
      periodoFim,
      filtrosSelecionados,
      dados: tipoRelatorio === 'processos_por_status' ? dadosProcessosPorStatus() : 
             tipoRelatorio === 'processos_por_tipo' ? dadosProcessosPorTipo() :
             tipoRelatorio === 'financeiro_resumo' ? dadosFinanceirosResumo() :
             dadosPerformanceTribunais()
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const renderRelatorio = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress size={60} />
        </Box>
      );
    }

    switch (tipoRelatorio) {
      case 'processos_por_status':
        const dadosStatus = dadosProcessosPorStatus();
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Processos por Status
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={dadosStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, quantidade }) => `${status}: ${quantidade}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantidade"
                      >
                        {dadosStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tabela de Dados
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Quantidade</TableCell>
                          <TableCell align="right">Percentual</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dadosStatus.map((item) => {
                          const total = dadosStatus.reduce((sum: number, d: any) => sum + d.quantidade, 0);
                          const percentual = ((item.quantidade / total) * 100).toFixed(1);
                          return (
                            <TableRow key={item.status}>
                              <TableCell>
                                <Chip label={item.status} size="small" />
                              </TableCell>
                              <TableCell align="right">{item.quantidade}</TableCell>
                              <TableCell align="right">{percentual}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 'processos_por_tipo':
        const dadosTipo = dadosProcessosPorTipo();
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Processos por Tipo
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={dadosTipo}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tipo" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="quantidade" fill="#1976d2" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tabela de Dados
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tipo</TableCell>
                          <TableCell align="right">Quantidade</TableCell>
                          <TableCell align="right">Percentual</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dadosTipo.map((item) => {
                          const total = dadosTipo.reduce((sum: number, d: any) => sum + d.quantidade, 0);
                          const percentual = ((item.quantidade / total) * 100).toFixed(1);
                          return (
                            <TableRow key={item.tipo}>
                              <TableCell>
                                <Chip label={item.tipo} size="small" />
                              </TableCell>
                              <TableCell align="right">{item.quantidade}</TableCell>
                              <TableCell align="right">{percentual}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 'financeiro_resumo':
        const dadosFinanceiros = dadosFinanceirosResumo();
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo Financeiro
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={dadosFinanceiros}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']} />
                      <Bar dataKey="valor" fill="#8884d8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Valores Detalhados
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Categoria</TableCell>
                          <TableCell align="right">Valor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dadosFinanceiros.map((item) => (
                          <TableRow key={item.categoria}>
                            <TableCell>
                              <Chip label={item.categoria} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 'performance_tribunais':
        const dadosTribunais = dadosPerformanceTribunais();
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance por Tribunal
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBarChart data={dadosTribunais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tribunal" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="quantidade" fill="#00C49F" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Alert severity="info">
            Selecione um tipo de relatório para visualizar os dados.
          </Alert>
        );
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Assessment sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4">
              Relatórios Avançados
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Análise detalhada de processos e dados financeiros
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            disabled={loading}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            disabled={loading}
          >
            Compartilhar
          </Button>
        </Box>
      </Box>

      {/* Filtros Avançados */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtros Avançados
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Relatório</InputLabel>
                <Select
                  value={tipoRelatorio}
                  onChange={(e) => setTipoRelatorio(e.target.value)}
                  label="Tipo de Relatório"
                >
                  <MenuItem value="processos_por_status">Processos por Status</MenuItem>
                  <MenuItem value="processos_por_tipo">Processos por Tipo</MenuItem>
                  <MenuItem value="financeiro_resumo">Resumo Financeiro</MenuItem>
                  <MenuItem value="performance_tribunais">Performance por Tribunal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Período Início"
                type="date"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Período Fim"
                type="date"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Assessment />}
                onClick={handleGerarRelatorio}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Gerar'}
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExportarRelatorio}
                  disabled={loading}
                  fullWidth
                >
                  Exportar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={() => setFiltrosSelecionados([])}
                  disabled={filtrosSelecionados.length === 0}
                >
                  Limpar
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Filtros de Dados:
          </Typography>
          <FormGroup row>
            {opcoesFiltros.map((filtro) => (
              <FormControlLabel
                key={filtro.id}
                control={
                  <Checkbox
                    checked={filtrosSelecionados.includes(filtro.id)}
                    onChange={() => handleFiltroChange(filtro.id)}
                  />
                }
                label={filtro.label}
              />
            ))}
          </FormGroup>
        </CardContent>
      </Card>

      {/* Relatório */}
      {renderRelatorio()}

      {/* Dialog de Exportação */}
      <Dialog open={dialogExportacao} onClose={() => setDialogExportacao(false)}>
        <DialogTitle>
          Exportar Relatório
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Selecione o formato de exportação:
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Formato</InputLabel>
            <Select
              value={formatoExportacao}
              onChange={(e) => setFormatoExportacao(e.target.value)}
              label="Formato"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogExportacao(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmarExportacao} variant="contained">
            Exportar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Relatorios;





