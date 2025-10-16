import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Add,
  AttachFile,
  Business,
  Phone,
  Email,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Processo } from '../types';
import { useProcessos } from '../hooks/useProcessos';
import toast from 'react-hot-toast';

// Dados mockados para demonstração
const mockProcessoDetalhes: Processo = {
  id: '1',
  numero: '0001234-56.2024.1.01.0001',
  tipo: 'civel',
  status: 'ativo',
  assunto: 'Ação de Cobrança',
  valorCausa: 50000,
  dataDistribuicao: new Date('2024-01-01'),
  dataUltimaMovimentacao: new Date('2024-01-15'),
  cliente: {
    nome: 'Empresa ABC Ltda',
    cpfCnpj: '12.345.678/0001-90',
    email: 'contato@empresaabc.com',
    telefone: '(11) 99999-9999',
  },
  advogadoResponsavel: 'João Silva',
  tribunal: 'TJSP',
  vara: '1ª Vara Cível',
  movimentacoes: [
    {
      id: '1',
      data: new Date('2024-01-01'),
      tipo: 'Distribuição',
      descricao: 'Processo distribuído',
      usuario: 'Sistema',
    },
    {
      id: '2',
      data: new Date('2024-01-05'),
      tipo: 'Petição',
      descricao: 'Petição inicial protocolada',
      usuario: 'João Silva',
    },
    {
      id: '3',
      data: new Date('2024-01-10'),
      tipo: 'Despacho',
      descricao: 'Despacho de citação',
      usuario: 'Juiz Maria Santos',
    },
    {
      id: '4',
      data: new Date('2024-01-15'),
      tipo: 'Citação',
      descricao: 'Citação realizada',
      usuario: 'Oficial de Justiça',
    },
  ],
  documentos: [
    {
      id: '1',
      nome: 'Petição Inicial.pdf',
      tipo: 'Petição',
      tamanho: 1024000,
      dataUpload: new Date('2024-01-05'),
      url: '/documentos/peticao-inicial.pdf',
    },
    {
      id: '2',
      nome: 'Contrato.pdf',
      tipo: 'Documento',
      tamanho: 512000,
      dataUpload: new Date('2024-01-05'),
      url: '/documentos/contrato.pdf',
    },
  ],
  observacoes: 'Processo de cobrança de valores em atraso. Cliente possui histórico de pagamentos.',
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProcessoDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { processos, adicionarMovimentacao, loading } = useProcessos();
  const [tabValue, setTabValue] = useState(0);
  const [dialogMovimentacao, setDialogMovimentacao] = useState(false);
  const [novaMovimentacao, setNovaMovimentacao] = useState({
    tipo: '',
    descricao: '',
  });

  const processo = processos.find(p => p.id === id) || mockProcessoDetalhes;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success';
      case 'arquivado': return 'default';
      case 'suspenso': return 'warning';
      case 'concluido': return 'info';
      default: return 'default';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'civel': return 'primary';
      case 'criminal': return 'error';
      case 'trabalhista': return 'warning';
      case 'tributario': return 'info';
      case 'administrativo': return 'secondary';
      default: return 'default';
    }
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNovaMovimentacao = () => {
    setDialogMovimentacao(true);
  };

  const handleFecharDialogMovimentacao = () => {
    setDialogMovimentacao(false);
    setNovaMovimentacao({ tipo: '', descricao: '' });
  };

  const handleSalvarMovimentacao = async () => {
    if (!processo.id) return;
    
    try {
      await adicionarMovimentacao(processo.id, {
        tipo: novaMovimentacao.tipo,
        descricao: novaMovimentacao.descricao,
        usuario: 'Usuário Atual', // Em produção seria o usuário logado
      });
      
      toast.success('Movimentação adicionada com sucesso!');
      handleFecharDialogMovimentacao();
    } catch (err) {
      toast.error('Erro ao adicionar movimentação');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Cabeçalho */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/processos')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" gutterBottom>
            {processo.numero}
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <Chip
              label={getTipoLabel(processo.tipo)}
              color={getTipoColor(processo.tipo) as any}
            />
            <Chip
              label={getStatusLabel(processo.status)}
              color={getStatusColor(processo.status) as any}
            />
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          sx={{ ml: 2 }}
        >
          Editar Processo
        </Button>
      </Box>

      {/* Informações Gerais */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações do Processo
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Assunto"
                    secondary={processo.assunto}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Valor da Causa"
                    secondary={
                      processo.valorCausa
                        ? `R$ ${processo.valorCausa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : 'Não informado'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Tribunal"
                    secondary={processo.tribunal}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Vara"
                    secondary={processo.vara}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Data de Distribuição"
                    secondary={processo.dataDistribuicao.toLocaleDateString('pt-BR')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Última Movimentação"
                    secondary={processo.dataUltimaMovimentacao.toLocaleDateString('pt-BR')}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações do Cliente
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Business />
                  </ListItemIcon>
                  <ListItemText
                    primary={processo.cliente.nome}
                    secondary={processo.cliente.cpfCnpj}
                  />
                </ListItem>
                {processo.cliente.email && (
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText secondary={processo.cliente.email} />
                  </ListItem>
                )}
                {processo.cliente.telefone && (
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText secondary={processo.cliente.telefone} />
                  </ListItem>
                )}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Advogado Responsável
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {processo.advogadoResponsavel}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Movimentações" />
            <Tab label="Documentos" />
            <Tab label="Observações" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Histórico de Movimentações
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleNovaMovimentacao}
            >
              Nova Movimentação
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Usuário</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processo.movimentacoes.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>
                      {mov.data.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Chip label={mov.tipo} size="small" />
                    </TableCell>
                    <TableCell>{mov.descricao}</TableCell>
                    <TableCell>{mov.usuario}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Documentos Anexados
          </Typography>
          <List>
            {processo.documentos.map((doc) => (
              <ListItem key={doc.id} divider>
                <ListItemIcon>
                  <AttachFile />
                </ListItemIcon>
                <ListItemText
                  primary={doc.nome}
                  secondary={`${doc.tipo} - ${formatFileSize(doc.tamanho)} - ${doc.dataUpload.toLocaleDateString('pt-BR')}`}
                />
                <Button size="small" variant="outlined">
                  Download
                </Button>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Observações
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {processo.observacoes || 'Nenhuma observação registrada.'}
          </Typography>
        </TabPanel>
      </Card>

      {/* Dialog Nova Movimentação */}
      <Dialog open={dialogMovimentacao} onClose={handleFecharDialogMovimentacao} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Movimentação</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={novaMovimentacao.tipo}
              onChange={(e) => setNovaMovimentacao({ ...novaMovimentacao, tipo: e.target.value })}
              label="Tipo"
            >
              <MenuItem value="peticao">Petição</MenuItem>
              <MenuItem value="despacho">Despacho</MenuItem>
              <MenuItem value="sentenca">Sentença</MenuItem>
              <MenuItem value="audiencia">Audiência</MenuItem>
              <MenuItem value="citacao">Citação</MenuItem>
              <MenuItem value="intimacao">Intimação</MenuItem>
              <MenuItem value="outros">Outros</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Descrição"
            multiline
            rows={4}
            value={novaMovimentacao.descricao}
            onChange={(e) => setNovaMovimentacao({ ...novaMovimentacao, descricao: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDialogMovimentacao}>Cancelar</Button>
          <Button onClick={handleSalvarMovimentacao} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessoDetalhes;






