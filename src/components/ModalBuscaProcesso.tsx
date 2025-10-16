import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Search,
  Close,
  Person,
  Business,
  Gavel,
  AttachMoney,
  CalendarToday,
  LocationOn,
  CheckCircle,
} from '@mui/icons-material';
import { TribunalAPIService } from '../services/TribunalAPIService';
import { Processo } from '../types';

interface ModalBuscaProcessoProps {
  open: boolean;
  onClose: () => void;
  onProcessoCriado: (processo: Processo) => void;
}

const ModalBuscaProcesso: React.FC<ModalBuscaProcessoProps> = ({
  open,
  onClose,
  onProcessoCriado,
}) => {
  const [numeroProcesso, setNumeroProcesso] = useState('1017593-56.2022.8.26.0001');
  const [loading, setLoading] = useState(false);
  const [processoEncontrado, setProcessoEncontrado] = useState<Processo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  // Busca automática quando o modal abre
  useEffect(() => {
    if (open && numeroProcesso) {
      handleBuscarProcesso();
    }
  }, [open]);

  const handleBuscarProcesso = async () => {
    if (!numeroProcesso.trim()) return;

    setLoading(true);
    setError(null);
    setProcessoEncontrado(null);
    setBuscaRealizada(false);

    try {
      console.log(`🔍 Buscando processo: ${numeroProcesso}`);
      const processo = await TribunalAPIService.buscarProcessoEmTodosTribunais(numeroProcesso);

      if (processo) {
        setProcessoEncontrado(processo);
        setBuscaRealizada(true);
        console.log('✅ Processo encontrado:', processo);
        console.log('📋 Dados do processo:', {
          numero: processo.numero,
          classe: processo.classe,
          assunto: processo.assunto,
          valorCausa: processo.valorCausa,
          partes: processo.partes,
          movimentacoes: processo.movimentacoes
        });
      } else {
        setError('Processo não encontrado ou erro na extração de dados.');
        console.log('❌ Processo não encontrado');
      }
    } catch (err: any) {
      setError(`Erro na busca: ${err.message}`);
      console.error('💥 Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarProcesso = () => {
    if (processoEncontrado) {
      onProcessoCriado(processoEncontrado);
      handleFecharModal();
    }
  };

  const handleFecharModal = () => {
    setNumeroProcesso('1017593-56.2022.8.26.0001');
    setProcessoEncontrado(null);
    setError(null);
    setBuscaRealizada(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleFecharModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Search sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Buscar e Criar Processo</Typography>
        </Box>
        <IconButton onClick={handleFecharModal} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Campo de busca */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Número do Processo"
            value={numeroProcesso}
            onChange={(e) => setNumeroProcesso(e.target.value)}
            placeholder="Ex: 1017593-56.2022.8.26.0001"
            disabled={loading}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: loading ? <CircularProgress size={20} /> : null,
            }}
          />
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleBuscarProcesso}
            disabled={loading || !numeroProcesso.trim()}
            fullWidth
          >
            {loading ? 'Buscando...' : 'Buscar Processo'}
          </Button>
        </Box>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Buscando dados do tribunal...</Typography>
          </Box>
        )}

        {/* Erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Processo encontrado */}
        {processoEncontrado && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <CheckCircle sx={{ mr: 1 }} />
              Processo encontrado! Verifique os dados abaixo e clique em "Criar Processo".
            </Alert>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Gavel sx={{ mr: 1, color: 'primary.main' }} />
                  Informações do Processo
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Número do Processo
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {processoEncontrado.numero}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Tribunal
                    </Typography>
                    <Chip label={processoEncontrado.tribunal} color="primary" sx={{ mb: 1 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Classe Processual
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {processoEncontrado.classe || 'Não informado'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Assunto
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {processoEncontrado.assunto || 'Não informado'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Vara
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {processoEncontrado.vara || 'Não informado'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Valor da Causa
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>
                      {processoEncontrado.valorCausa ? `R$ ${processoEncontrado.valorCausa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não informado'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Partes do Processo */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  Partes do Processo
                </Typography>
                
                {processoEncontrado.partes && processoEncontrado.partes.length > 0 ? (
                  <Grid container spacing={2}>
                    {processoEncontrado.partes.map((parte, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            {parte.tipo === 'autor' ? 'Autor' : 'Réu'}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {parte.nome || 'Não informado'}
                          </Typography>
                          {parte.advogado && (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                              Advogado: {parte.advogado}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Partes não encontradas
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Movimentações */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                  Movimentações ({processoEncontrado.movimentacoes?.length || 0})
                </Typography>
                
                {processoEncontrado.movimentacoes && processoEncontrado.movimentacoes.length > 0 ? (
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {processoEncontrado.movimentacoes.slice(0, 5).map((mov, index) => (
                      <Box key={index} sx={{ mb: 2, p: 1, borderLeft: '3px solid #1976d2', pl: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(mov.data).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {mov.tipo}
                        </Typography>
                        <Typography variant="body2">
                          {mov.descricao}
                        </Typography>
                      </Box>
                    ))}
                    {processoEncontrado.movimentacoes.length > 5 && (
                      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 1 }}>
                        ... e mais {processoEncontrado.movimentacoes.length - 5} movimentações
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma movimentação encontrada
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleFecharModal} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleCriarProcesso}
          variant="contained"
          disabled={!processoEncontrado}
          startIcon={<CheckCircle />}
        >
          Criar Processo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalBuscaProcesso;







  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Search,
  Close,
  Person,
  Business,
  Gavel,
  AttachMoney,
  CalendarToday,
  LocationOn,
  CheckCircle,
} from '@mui/icons-material';
import { TribunalAPIService } from '../services/TribunalAPIService';
import { Processo } from '../types';

interface ModalBuscaProcessoProps {
  open: boolean;
  onClose: () => void;
  onProcessoCriado: (processo: Processo) => void;
}

const ModalBuscaProcesso: React.FC<ModalBuscaProcessoProps> = ({
  open,
  onClose,
  onProcessoCriado,
}) => {
  const [numeroProcesso, setNumeroProcesso] = useState('1017593-56.2022.8.26.0001');
  const [loading, setLoading] = useState(false);
  const [processoEncontrado, setProcessoEncontrado] = useState<Processo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  // Busca automática quando o modal abre
  useEffect(() => {
    if (open && numeroProcesso) {
      handleBuscarProcesso();
    }
  }, [open]);

  const handleBuscarProcesso = async () => {
    if (!numeroProcesso.trim()) return;

    setLoading(true);
    setError(null);
    setProcessoEncontrado(null);
    setBuscaRealizada(false);

    try {
      console.log(`🔍 Buscando processo: ${numeroProcesso}`);
      const processo = await TribunalAPIService.buscarProcessoEmTodosTribunais(numeroProcesso);

      if (processo) {
        setProcessoEncontrado(processo);
        setBuscaRealizada(true);
        console.log('✅ Processo encontrado:', processo);
        console.log('📋 Dados do processo:', {
          numero: processo.numero,
          classe: processo.classe,
          assunto: processo.assunto,
          valorCausa: processo.valorCausa,
          partes: processo.partes,
          movimentacoes: processo.movimentacoes
        });
      } else {
        setError('Processo não encontrado ou erro na extração de dados.');
        console.log('❌ Processo não encontrado');
      }
    } catch (err: any) {
      setError(`Erro na busca: ${err.message}`);
      console.error('💥 Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarProcesso = () => {
    if (processoEncontrado) {
      onProcessoCriado(processoEncontrado);
      handleFecharModal();
    }
  };

  const handleFecharModal = () => {
    setNumeroProcesso('1017593-56.2022.8.26.0001');
    setProcessoEncontrado(null);
    setError(null);
    setBuscaRealizada(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleFecharModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Search sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Buscar e Criar Processo</Typography>
        </Box>
        <IconButton onClick={handleFecharModal} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Campo de busca */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Número do Processo"
            value={numeroProcesso}
            onChange={(e) => setNumeroProcesso(e.target.value)}
            placeholder="Ex: 1017593-56.2022.8.26.0001"
            disabled={loading}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: loading ? <CircularProgress size={20} /> : null,
            }}
          />
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleBuscarProcesso}
            disabled={loading || !numeroProcesso.trim()}
            fullWidth
          >
            {loading ? 'Buscando...' : 'Buscar Processo'}
          </Button>
        </Box>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Buscando dados do tribunal...</Typography>
          </Box>
        )}

        {/* Erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Processo encontrado */}
        {processoEncontrado && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <CheckCircle sx={{ mr: 1 }} />
              Processo encontrado! Verifique os dados abaixo e clique em "Criar Processo".
            </Alert>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Gavel sx={{ mr: 1, color: 'primary.main' }} />
                  Informações do Processo
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Número do Processo
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {processoEncontrado.numero}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Tribunal
                    </Typography>
                    <Chip label={processoEncontrado.tribunal} color="primary" sx={{ mb: 1 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Classe Processual
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {processoEncontrado.classe || 'Não informado'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Assunto
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {processoEncontrado.assunto || 'Não informado'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Vara
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {processoEncontrado.vara || 'Não informado'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Valor da Causa
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>
                      {processoEncontrado.valorCausa ? `R$ ${processoEncontrado.valorCausa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não informado'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Partes do Processo */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  Partes do Processo
                </Typography>
                
                {processoEncontrado.partes && processoEncontrado.partes.length > 0 ? (
                  <Grid container spacing={2}>
                    {processoEncontrado.partes.map((parte, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            {parte.tipo === 'autor' ? 'Autor' : 'Réu'}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {parte.nome || 'Não informado'}
                          </Typography>
                          {parte.advogado && (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                              Advogado: {parte.advogado}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Partes não encontradas
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Movimentações */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                  Movimentações ({processoEncontrado.movimentacoes?.length || 0})
                </Typography>
                
                {processoEncontrado.movimentacoes && processoEncontrado.movimentacoes.length > 0 ? (
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {processoEncontrado.movimentacoes.slice(0, 5).map((mov, index) => (
                      <Box key={index} sx={{ mb: 2, p: 1, borderLeft: '3px solid #1976d2', pl: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(mov.data).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {mov.tipo}
                        </Typography>
                        <Typography variant="body2">
                          {mov.descricao}
                        </Typography>
                      </Box>
                    ))}
                    {processoEncontrado.movimentacoes.length > 5 && (
                      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 1 }}>
                        ... e mais {processoEncontrado.movimentacoes.length - 5} movimentações
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma movimentação encontrada
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleFecharModal} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleCriarProcesso}
          variant="contained"
          disabled={!processoEncontrado}
          startIcon={<CheckCircle />}
        >
          Criar Processo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalBuscaProcesso;




