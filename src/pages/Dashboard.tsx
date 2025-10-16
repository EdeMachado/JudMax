import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Button,
  IconButton,
  Avatar,
  LinearProgress,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  Gavel,
  Archive,
  CheckCircle,
  Warning,
  Schedule,
  AttachMoney,
  Receipt,
  Payment,
  Dashboard as DashboardIcon,
  Refresh,
  Notifications,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  TrendingDown,
  Assessment,
  Timeline,
  People,
  Business,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { DashboardData } from '../types';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { useProcessos } from '../hooks/useProcessos';

// Dados mockados para demonstração
const mockDashboardData: DashboardData = {
  totalProcessos: 1247,
  processosAtivos: 892,
  processosArquivados: 203,
  processosConcluidos: 152,
  processosPorTipo: [
    { tipo: 'Cível', quantidade: 456 },
    { tipo: 'Criminal', quantidade: 234 },
    { tipo: 'Trabalhista', quantidade: 312 },
    { tipo: 'Tributário', quantidade: 145 },
    { tipo: 'Administrativo', quantidade: 100 },
  ],
  processosPorStatus: [
    { status: 'Ativo', quantidade: 892 },
    { status: 'Arquivado', quantidade: 203 },
    { status: 'Suspenso', quantidade: 45 },
    { status: 'Concluído', quantidade: 152 },
  ],
  movimentacoesRecentes: [
    {
      id: '1',
      data: new Date('2024-01-15'),
      tipo: 'Petição',
      descricao: 'Petição inicial protocolada',
      usuario: 'João Silva',
    },
    {
      id: '2',
      data: new Date('2024-01-14'),
      tipo: 'Sentença',
      descricao: 'Sentença proferida',
      usuario: 'Maria Santos',
    },
    {
      id: '3',
      data: new Date('2024-01-13'),
      tipo: 'Audiência',
      descricao: 'Audiência de conciliação realizada',
      usuario: 'Pedro Costa',
    },
  ],
  processosVencendo: [
    {
      id: '1',
      numero: '0001234-56.2024.1.01.0001',
      tipo: 'civel',
      status: 'ativo',
      assunto: 'Ação de Cobrança',
      dataDistribuicao: new Date('2024-01-01'),
      dataUltimaMovimentacao: new Date('2024-01-10'),
      cliente: { nome: 'Empresa ABC Ltda', cpfCnpj: '12.345.678/0001-90' },
      advogadoResponsavel: 'João Silva',
      tribunal: 'TJSP',
      vara: '1ª Vara Cível',
      movimentacoes: [],
      documentos: [],
    },
    {
      id: '2',
      numero: '0001235-67.2024.1.01.0002',
      tipo: 'trabalhista',
      status: 'ativo',
      assunto: 'Reclamação Trabalhista',
      dataDistribuicao: new Date('2024-01-02'),
      dataUltimaMovimentacao: new Date('2024-01-11'),
      cliente: { nome: 'José da Silva', cpfCnpj: '123.456.789-00' },
      advogadoResponsavel: 'Maria Santos',
      tribunal: 'TRT2',
      vara: '2ª Vara do Trabalho',
      movimentacoes: [],
      documentos: [],
    },
  ],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard: React.FC = () => {
  const { buscarTodosFinanceiros } = useFinanceiro();
  const { processos } = useProcessos();
  const [dadosFinanceiros, setDadosFinanceiros] = React.useState({
    totalHonorarios: 0,
    totalDespesas: 0,
    totalRecebido: 0,
    saldoPendente: 0,
  });

  React.useEffect(() => {
    const carregarDadosFinanceiros = async () => {
      try {
        const financeiros = await buscarTodosFinanceiros();
        const totalHonorarios = financeiros.reduce((sum, f) => 
          sum + f.honorarios.reduce((s, h) => s + h.valor, 0), 0
        );
        const totalDespesas = financeiros.reduce((sum, f) => 
          sum + f.despesas.reduce((s, d) => s + d.valor, 0), 0
        );
        const totalRecebido = financeiros.reduce((sum, f) => 
          sum + f.pagamentos.reduce((s, p) => s + p.valor, 0), 0
        );
        
        setDadosFinanceiros({
          totalHonorarios,
          totalDespesas,
          totalRecebido,
          saldoPendente: totalHonorarios + totalDespesas - totalRecebido,
        });
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
      }
    };

    carregarDadosFinanceiros();
  }, [buscarTodosFinanceiros]);

  // Calcular dados reais dos processos
  const data = {
    totalProcessos: processos.length,
    processosAtivos: processos.filter(p => p.status === 'ativo').length,
    processosArquivados: processos.filter(p => p.status === 'arquivado').length,
    processosConcluidos: processos.filter(p => p.status === 'concluido').length,
    processosPorStatus: [
      { status: 'Ativo', quantidade: processos.filter(p => p.status === 'ativo').length },
      { status: 'Arquivado', quantidade: processos.filter(p => p.status === 'arquivado').length },
      { status: 'Concluído', quantidade: processos.filter(p => p.status === 'concluido').length },
      { status: 'Suspenso', quantidade: processos.filter(p => p.status === 'suspenso').length },
    ],
    processosPorTipo: [
      { tipo: 'Cível', quantidade: processos.filter(p => p.tipo === 'civel').length },
      { tipo: 'Criminal', quantidade: processos.filter(p => p.tipo === 'criminal').length },
      { tipo: 'Trabalhista', quantidade: processos.filter(p => p.tipo === 'trabalhista').length },
      { tipo: 'Tributário', quantidade: processos.filter(p => p.tipo === 'tributario').length },
      { tipo: 'Administrativo', quantidade: processos.filter(p => p.tipo === 'administrativo').length },
    ],
    processosVencendo: processos.filter(p => {
      const diasDesdeUltimaMovimentacao = Math.floor((Date.now() - p.dataUltimaMovimentacao.getTime()) / (1000 * 60 * 60 * 24));
      return diasDesdeUltimaMovimentacao > 30 && p.status === 'ativo';
    }).slice(0, 5),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'success';
      case 'Arquivado': return 'default';
      case 'Suspenso': return 'warning';
      case 'Concluído': return 'info';
      default: return 'default';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Cível': return 'primary';
      case 'Criminal': return 'error';
      case 'Trabalhista': return 'warning';
      case 'Tributário': return 'info';
      case 'Administrativo': return 'secondary';
      default: return 'default';
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    trend, 
    trendValue, 
    gradient 
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    gradient?: string;
  }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: gradient || 'white',
        color: gradient ? 'white' : 'inherit',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: 6,
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: gradient ? 0.9 : 0.7,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                mt: 1,
                mb: 1
              }}
            >
              {value}
            </Typography>
            {trend && trendValue && (
              <Box display="flex" alignItems="center">
                {trend === 'up' ? (
                  <ArrowUpward sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 16, mr: 0.5, color: 'error.main' }} />
                )}
                <Typography 
                  variant="body2" 
                  color={trend === 'up' ? 'success.main' : 'error.main'}
                  sx={{ fontWeight: 600 }}
                >
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: gradient ? 'rgba(255,255,255,0.2)' : `${color}.main`,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <DashboardIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Dashboard Executivo
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Visão geral do sistema de controle de processos judiciais
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <IconButton color="primary">
            <Refresh />
          </IconButton>
          <IconButton color="primary">
            <Notifications />
          </IconButton>
          <IconButton color="primary">
            <MoreVert />
          </IconButton>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Cards de Resumo Principais */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Processos"
            value={data.totalProcessos.toLocaleString()}
            icon={<Gavel />}
            color="primary"
            trend="up"
            trendValue="+12% este mês"
            gradient="linear-gradient(135deg, #1e3a8a 0%, #64748b 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Processos Ativos"
            value={data.processosAtivos.toLocaleString()}
            icon={<TrendingUp />}
            color="success"
            trend="up"
            trendValue="+8% este mês"
            gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Arquivados"
            value={data.processosArquivados.toLocaleString()}
            icon={<Archive />}
            color="default"
            trend="down"
            trendValue="-3% este mês"
            gradient="linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Concluídos"
            value={data.processosConcluidos.toLocaleString()}
            icon={<CheckCircle />}
            color="info"
            trend="up"
            trendValue="+15% este mês"
            gradient="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
          />
        </Grid>

        {/* Cards Financeiros */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
            Resumo Financeiro
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Honorários"
            value={`R$ ${dadosFinanceiros.totalHonorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<AttachMoney />}
            color="primary"
            trend="up"
            trendValue="+22% este mês"
            gradient="linear-gradient(135deg, #1e3a8a 0%, #64748b 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Despesas"
            value={`R$ ${dadosFinanceiros.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<Receipt />}
            color="warning"
            trend="down"
            trendValue="-5% este mês"
            gradient="linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Recebido"
            value={`R$ ${dadosFinanceiros.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<Payment />}
            color="success"
            trend="up"
            trendValue="+18% este mês"
            gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Saldo Pendente"
            value={`R$ ${dadosFinanceiros.saldoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<TrendingDown />}
            color={dadosFinanceiros.saldoPendente > 0 ? "error" : "success"}
            trend={dadosFinanceiros.saldoPendente > 0 ? "up" : "down"}
            trendValue={dadosFinanceiros.saldoPendente > 0 ? "+12% este mês" : "-8% este mês"}
            gradient={dadosFinanceiros.saldoPendente > 0 
              ? "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)" 
              : "linear-gradient(135deg, #059669 0%, #10b981 100%)"
            }
          />
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Processos por Tipo
                </Typography>
                <Button size="small" endIcon={<MoreVert />}>
                  Mais
                </Button>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.processosPorTipo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Bar dataKey="quantidade" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Status dos Processos
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.processosPorStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, quantidade }) => `${status}: ${quantidade}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {data.processosPorStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Movimentações Recentes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Movimentações Recentes
                </Typography>
                <Button size="small" endIcon={<MoreVert />}>
                  Ver Todas
                </Button>
              </Box>
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {processos
                  .flatMap(p => p.movimentacoes.map(mov => ({ ...mov, processoNumero: p.numero })))
                  .sort((a, b) => b.data.getTime() - a.data.getTime())
                  .slice(0, 5)
                  .map((mov, index) => (
                  <React.Fragment key={`${mov.processoNumero}-${mov.id}`}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <Schedule sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {mov.descricao}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              {mov.processoNumero} • {mov.usuario}
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                              {mov.data.toLocaleDateString('pt-BR')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Processos Vencendo */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Processos Próximos ao Vencimento
                </Typography>
                <Button size="small" endIcon={<MoreVert />}>
                  Ver Todos
                </Button>
              </Box>
              {data.processosVencendo.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {data.processosVencendo.map((processo, index) => (
                    <React.Fragment key={processo.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                            <Warning sx={{ fontSize: 16 }} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                              {processo.numero}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {processo.assunto}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={processo.tipo}
                                  size="small"
                                  color={getTipoColor(processo.tipo) as any}
                                  sx={{ mr: 1, fontSize: '0.7rem' }}
                                />
                                <Chip
                                  label={processo.status}
                                  size="small"
                                  color={getStatusColor(processo.status) as any}
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < data.processosVencendo.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <CheckCircle sx={{ mr: 1 }} />
                  Nenhum processo próximo ao vencimento!
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;





