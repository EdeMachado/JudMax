import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Close,
  Gavel,
  Person,
  Business,
  CalendarToday,
  AttachMoney,
  LocationOn,
  Refresh,
  Timeline,
  Description,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
import { Processo } from '../types';
import { TribunalAPIService } from '../services/TribunalAPIService';

interface ModalDetalhesProcessoProps {
  open: boolean;
  onClose: () => void;
  processo: Processo | null;
}

const ModalDetalhesProcesso: React.FC<ModalDetalhesProcessoProps> = ({
  open,
  onClose,
  processo,
}) => {
  const [loading, setLoading] = useState(false);
  const [processoAtualizado, setProcessoAtualizado] = useState<Processo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [maximizado, setMaximizado] = useState(false);

  // Atualizar dados quando o modal abre
  useEffect(() => {
    if (open && processo) {
      handleAtualizarProcesso();
    }
  }, [open, processo]);

  const handleAtualizarProcesso = async () => {
    if (!processo?.numero) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Atualizando processo: ${processo.numero}`);
      const processoAtualizado = await TribunalAPIService.buscarProcessoEmTodosTribunais(processo.numero);

      if (processoAtualizado) {
        setProcessoAtualizado(processoAtualizado);
        setUltimaAtualizacao(new Date());
        console.log('✅ Processo atualizado:', processoAtualizado);
      } else {
        setError('Erro ao atualizar dados do processo.');
      }
    } catch (err: any) {
      setError(`Erro na atualização: ${err.message}`);
      console.error('💥 Erro na atualização:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFecharModal = () => {
    setProcessoAtualizado(null);
    setError(null);
    setUltimaAtualizacao(null);
    setMaximizado(false);
    onClose();
  };

  const toggleMaximizar = () => {
    setMaximizado(!maximizado);
  };

  const dadosProcesso = processoAtualizado || processo;

  if (!dadosProcesso) return null;

  return (
    <Dialog
      open={open}
      onClose={handleFecharModal}
      maxWidth={maximizado ? false : "lg"}
      fullWidth={!maximizado}
      fullScreen={maximizado}
      PaperProps={{
        sx: { 
          minHeight: maximizado ? '100vh' : '700px',
          ...(maximizado && { m: 0, borderRadius: 0 })
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Gavel sx={{ mr: 1, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6">Detalhes do Processo</Typography>
            <Typography variant="body2" color="textSecondary">
              {dadosProcesso.numero}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {ultimaAtualizacao && (
            <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
              Atualizado: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
            </Typography>
          )}
          <IconButton onClick={handleAtualizarProcesso} disabled={loading} size="small" sx={{ mr: 1 }} title="Atualizar dados">
            <Refresh />
          </IconButton>
          <IconButton onClick={toggleMaximizar} size="small" title={maximizado ? "Minimizar" : "Maximizar"}>
            {maximizado ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          <IconButton onClick={handleFecharModal} size="small" title="Fechar">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 2 }}>Atualizando dados...</Typography>
          </Box>
        )}

        {/* Erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Informações Principais */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Gavel sx={{ mr: 1, color: 'primary.main' }} />
              Informações do Processo
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Tribunal
                  </Typography>
                  <Chip label={dadosProcesso.tribunal} color="primary" />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Classe Processual
                  </Typography>
                  <Typography variant="body1">
                    {dadosProcesso.classe || 'Não informado'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Assunto
                  </Typography>
                  <Typography variant="body1">
                    {dadosProcesso.assunto || 'Não informado'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Vara
                  </Typography>
                  <Typography variant="body1">
                    {dadosProcesso.vara || 'Não informado'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Valor da Causa
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {dadosProcesso.valorCausa ? `R$ ${dadosProcesso.valorCausa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não informado'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip 
                    label={dadosProcesso.situacao || 'Ativo'} 
                    color={dadosProcesso.situacao === 'Arquivado' ? 'default' : 'success'} 
                  />
                </Box>
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
            
            {dadosProcesso.partes && dadosProcesso.partes.length > 0 ? (
              <Grid container spacing={2}>
                {dadosProcesso.partes.map((parte, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {parte.tipo === 'autor' ? (
                          <Person sx={{ mr: 1, color: 'success.main' }} />
                        ) : (
                          <Business sx={{ mr: 1, color: 'error.main' }} />
                        )}
                        <Typography variant="subtitle2" color="primary">
                          {parte.tipo === 'autor' ? 'AUTOR' : 'RÉU'}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {parte.nome || 'Não informado'}
                      </Typography>
                      {parte.advogado && (
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Advogado:
                          </Typography>
                          <Typography variant="body2">
                            {parte.advogado}
                          </Typography>
                        </Box>
                      )}
                    </Card>
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

        {/* Movimentações em Tempo Real */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                Movimentações ({dadosProcesso.movimentacoes?.length || 0})
              </Typography>
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={handleAtualizarProcesso}
                disabled={loading}
              >
                Atualizar
              </Button>
            </Box>
            
            {dadosProcesso.movimentacoes && dadosProcesso.movimentacoes.length > 0 ? (
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                <List>
                  {dadosProcesso.movimentacoes.map((mov, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2 }}>
                        <ListItemIcon sx={{ mt: 1 }}>
                          <Description color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {mov.tipo}
                              </Typography>
                              <Chip 
                                label={new Date(mov.data).toLocaleDateString('pt-BR')} 
                                size="small" 
                                sx={{ ml: 2 }} 
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {mov.descricao}
                              </Typography>
                              {mov.usuario && (
                                <Typography variant="caption" color="textSecondary">
                                  Por: {mov.usuario}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dadosProcesso.movimentacoes!.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                Nenhuma movimentação encontrada
              </Typography>
            )}
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleFecharModal} color="inherit">
          Fechar
        </Button>
        <Button
          onClick={handleAtualizarProcesso}
          variant="outlined"
          startIcon={<Refresh />}
          disabled={loading}
        >
          Atualizar Dados
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDetalhesProcesso;







  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Close,
  Gavel,
  Person,
  Business,
  CalendarToday,
  AttachMoney,
  LocationOn,
  Refresh,
  Timeline,
  Description,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
import { Processo } from '../types';
import { TribunalAPIService } from '../services/TribunalAPIService';

interface ModalDetalhesProcessoProps {
  open: boolean;
  onClose: () => void;
  processo: Processo | null;
}

const ModalDetalhesProcesso: React.FC<ModalDetalhesProcessoProps> = ({
  open,
  onClose,
  processo,
}) => {
  const [loading, setLoading] = useState(false);
  const [processoAtualizado, setProcessoAtualizado] = useState<Processo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [maximizado, setMaximizado] = useState(false);

  // Atualizar dados quando o modal abre
  useEffect(() => {
    if (open && processo) {
      handleAtualizarProcesso();
    }
  }, [open, processo]);

  const handleAtualizarProcesso = async () => {
    if (!processo?.numero) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Atualizando processo: ${processo.numero}`);
      const processoAtualizado = await TribunalAPIService.buscarProcessoEmTodosTribunais(processo.numero);

      if (processoAtualizado) {
        setProcessoAtualizado(processoAtualizado);
        setUltimaAtualizacao(new Date());
        console.log('✅ Processo atualizado:', processoAtualizado);
      } else {
        setError('Erro ao atualizar dados do processo.');
      }
    } catch (err: any) {
      setError(`Erro na atualização: ${err.message}`);
      console.error('💥 Erro na atualização:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFecharModal = () => {
    setProcessoAtualizado(null);
    setError(null);
    setUltimaAtualizacao(null);
    setMaximizado(false);
    onClose();
  };

  const toggleMaximizar = () => {
    setMaximizado(!maximizado);
  };

  const dadosProcesso = processoAtualizado || processo;

  if (!dadosProcesso) return null;

  return (
    <Dialog
      open={open}
      onClose={handleFecharModal}
      maxWidth={maximizado ? false : "lg"}
      fullWidth={!maximizado}
      fullScreen={maximizado}
      PaperProps={{
        sx: { 
          minHeight: maximizado ? '100vh' : '700px',
          ...(maximizado && { m: 0, borderRadius: 0 })
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Gavel sx={{ mr: 1, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6">Detalhes do Processo</Typography>
            <Typography variant="body2" color="textSecondary">
              {dadosProcesso.numero}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {ultimaAtualizacao && (
            <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
              Atualizado: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
            </Typography>
          )}
          <IconButton onClick={handleAtualizarProcesso} disabled={loading} size="small" sx={{ mr: 1 }} title="Atualizar dados">
            <Refresh />
          </IconButton>
          <IconButton onClick={toggleMaximizar} size="small" title={maximizado ? "Minimizar" : "Maximizar"}>
            {maximizado ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          <IconButton onClick={handleFecharModal} size="small" title="Fechar">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 2 }}>Atualizando dados...</Typography>
          </Box>
        )}

        {/* Erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Informações Principais */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Gavel sx={{ mr: 1, color: 'primary.main' }} />
              Informações do Processo
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Tribunal
                  </Typography>
                  <Chip label={dadosProcesso.tribunal} color="primary" />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Classe Processual
                  </Typography>
                  <Typography variant="body1">
                    {dadosProcesso.classe || 'Não informado'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Assunto
                  </Typography>
                  <Typography variant="body1">
                    {dadosProcesso.assunto || 'Não informado'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Vara
                  </Typography>
                  <Typography variant="body1">
                    {dadosProcesso.vara || 'Não informado'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Valor da Causa
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {dadosProcesso.valorCausa ? `R$ ${dadosProcesso.valorCausa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não informado'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip 
                    label={dadosProcesso.situacao || 'Ativo'} 
                    color={dadosProcesso.situacao === 'Arquivado' ? 'default' : 'success'} 
                  />
                </Box>
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
            
            {dadosProcesso.partes && dadosProcesso.partes.length > 0 ? (
              <Grid container spacing={2}>
                {dadosProcesso.partes.map((parte, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {parte.tipo === 'autor' ? (
                          <Person sx={{ mr: 1, color: 'success.main' }} />
                        ) : (
                          <Business sx={{ mr: 1, color: 'error.main' }} />
                        )}
                        <Typography variant="subtitle2" color="primary">
                          {parte.tipo === 'autor' ? 'AUTOR' : 'RÉU'}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {parte.nome || 'Não informado'}
                      </Typography>
                      {parte.advogado && (
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Advogado:
                          </Typography>
                          <Typography variant="body2">
                            {parte.advogado}
                          </Typography>
                        </Box>
                      )}
                    </Card>
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

        {/* Movimentações em Tempo Real */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                Movimentações ({dadosProcesso.movimentacoes?.length || 0})
              </Typography>
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={handleAtualizarProcesso}
                disabled={loading}
              >
                Atualizar
              </Button>
            </Box>
            
            {dadosProcesso.movimentacoes && dadosProcesso.movimentacoes.length > 0 ? (
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                <List>
                  {dadosProcesso.movimentacoes.map((mov, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2 }}>
                        <ListItemIcon sx={{ mt: 1 }}>
                          <Description color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {mov.tipo}
                              </Typography>
                              <Chip 
                                label={new Date(mov.data).toLocaleDateString('pt-BR')} 
                                size="small" 
                                sx={{ ml: 2 }} 
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {mov.descricao}
                              </Typography>
                              {mov.usuario && (
                                <Typography variant="caption" color="textSecondary">
                                  Por: {mov.usuario}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dadosProcesso.movimentacoes!.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                Nenhuma movimentação encontrada
              </Typography>
            )}
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleFecharModal} color="inherit">
          Fechar
        </Button>
        <Button
          onClick={handleAtualizarProcesso}
          variant="outlined"
          startIcon={<Refresh />}
          disabled={loading}
        >
          Atualizar Dados
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDetalhesProcesso;




