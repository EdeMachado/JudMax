import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Notifications,
  Security,
  Palette,
  Storage,
  DeleteForever,
} from '@mui/icons-material';
import GerenciarBanco from '../components/GerenciarBanco';
import ZerarSistema from '../components/ZerarSistema';

const Configuracoes: React.FC = () => {
  const [tabAtiva, setTabAtiva] = useState(0);
  
  const [notificacoes, setNotificacoes] = useState({
    emailMovimentacoes: true,
    emailVencimentos: true,
    emailRelatorios: false,
    pushNotifications: true,
  });

  const [sistema, setSistema] = useState({
    tema: 'claro',
    idioma: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    autoBackup: true,
  });

  const [usuarios, setUsuarios] = useState([
    { id: '1', nome: 'João Silva', email: 'joao@exemplo.com', perfil: 'admin', ativo: true },
    { id: '2', nome: 'Maria Santos', email: 'maria@exemplo.com', perfil: 'advogado', ativo: true },
    { id: '3', nome: 'Pedro Costa', email: 'pedro@exemplo.com', perfil: 'estagiario', ativo: false },
  ]);

  const [dialogUsuario, setDialogUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);
  const [dialogZerarSistema, setDialogZerarSistema] = useState(false);

  const handleNotificacaoChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificacoes({ ...notificacoes, [key]: event.target.checked });
  };

  const handleSistemaChange = (key: string) => (event: any) => {
    setSistema({ ...sistema, [key]: event.target.value });
  };

  const handleSalvarConfiguracoes = () => {
    console.log('Salvando configurações:', { notificacoes, sistema });
    // Aqui seria implementada a lógica para salvar as configurações
  };

  const handleSistemaZerado = () => {
    // Recarregar a página após zerar o sistema
    window.location.reload();
  };

  const handleNovoUsuario = () => {
    setUsuarioEditando(null);
    setDialogUsuario(true);
  };

  const handleEditarUsuario = (usuario: any) => {
    setUsuarioEditando(usuario);
    setDialogUsuario(true);
  };

  const handleExcluirUsuario = (id: string) => {
    setUsuarios(usuarios.filter(u => u.id !== id));
  };

  const handleFecharDialogUsuario = () => {
    setDialogUsuario(false);
    setUsuarioEditando(null);
  };

  const handleSalvarUsuario = () => {
    // Aqui seria implementada a lógica para salvar o usuário
    handleFecharDialogUsuario();
  };

  const renderTabConteudo = () => {
    switch (tabAtiva) {
      case 0:
        return (
          <Grid container spacing={3}>
        {/* Configurações de Notificações */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Notifications sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Notificações
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificacoes.emailMovimentacoes}
                    onChange={handleNotificacaoChange('emailMovimentacoes')}
                  />
                }
                label="Email para movimentações"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificacoes.emailVencimentos}
                    onChange={handleNotificacaoChange('emailVencimentos')}
                  />
                }
                label="Email para vencimentos"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificacoes.emailRelatorios}
                    onChange={handleNotificacaoChange('emailRelatorios')}
                  />
                }
                label="Email para relatórios"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificacoes.pushNotifications}
                    onChange={handleNotificacaoChange('pushNotifications')}
                  />
                }
                label="Notificações push"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Configurações do Sistema */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Palette sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Sistema
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Tema</InputLabel>
                <Select
                  value={sistema.tema}
                  onChange={handleSistemaChange('tema')}
                  label="Tema"
                >
                  <MenuItem value="claro">Claro</MenuItem>
                  <MenuItem value="escuro">Escuro</MenuItem>
                  <MenuItem value="auto">Automático</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Idioma</InputLabel>
                <Select
                  value={sistema.idioma}
                  onChange={handleSistemaChange('idioma')}
                  label="Idioma"
                >
                  <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                  <MenuItem value="en-US">English (US)</MenuItem>
                  <MenuItem value="es-ES">Español</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Fuso Horário</InputLabel>
                <Select
                  value={sistema.timezone}
                  onChange={handleSistemaChange('timezone')}
                  label="Fuso Horário"
                >
                  <MenuItem value="America/Sao_Paulo">São Paulo (GMT-3)</MenuItem>
                  <MenuItem value="America/New_York">Nova York (GMT-5)</MenuItem>
                  <MenuItem value="Europe/London">Londres (GMT+0)</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={sistema.autoBackup}
                    onChange={(e) => setSistema({ ...sistema, autoBackup: e.target.checked })}
                  />
                }
                label="Backup automático"
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" color="error" gutterBottom>
                <DeleteForever sx={{ mr: 1, verticalAlign: 'middle' }} />
                Zona de Perigo
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForever />}
                onClick={() => setDialogZerarSistema(true)}
                fullWidth
                sx={{ mt: 1 }}
              >
                Zerar Sistema Completamente
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Gestão de Usuários */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <Security sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Usuários
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleNovoUsuario}
                >
                  Novo Usuário
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <List>
                {usuarios.map((usuario) => (
                  <ListItem key={usuario.id} divider>
                    <ListItemText
                      primary={usuario.nome}
                      secondary={`${usuario.email} - ${usuario.perfil}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditarUsuario(usuario)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleExcluirUsuario(usuario.id)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

            {/* Botão Salvar */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  size="large"
                  onClick={handleSalvarConfiguracoes}
                >
                  Salvar Configurações
                </Button>
              </Box>
            </Grid>
          </Grid>
        );
      case 1:
        return <GerenciarBanco />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabAtiva} onChange={(e, newValue) => setTabAtiva(newValue)}>
          <Tab label="Sistema" icon={<Palette />} />
          <Tab label="Banco de Dados" icon={<Storage />} />
        </Tabs>
      </Box>

      {renderTabConteudo()}

      {/* Dialog Usuário */}
      <Dialog open={dialogUsuario} onClose={handleFecharDialogUsuario} maxWidth="sm" fullWidth>
        <DialogTitle>
          {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nome"
            defaultValue={usuarioEditando?.nome || ''}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            defaultValue={usuarioEditando?.email || ''}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Perfil</InputLabel>
            <Select
              defaultValue={usuarioEditando?.perfil || 'estagiario'}
              label="Perfil"
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="advogado">Advogado</MenuItem>
              <MenuItem value="estagiario">Estagiário</MenuItem>
            </Select>
          </FormControl>
          {!usuarioEditando && (
            <TextField
              fullWidth
              margin="normal"
              label="Senha"
              type="password"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharDialogUsuario}>Cancelar</Button>
          <Button onClick={handleSalvarUsuario} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <ZerarSistema
        open={dialogZerarSistema}
        onClose={() => setDialogZerarSistema(false)}
        onSistemaZerado={handleSistemaZerado}
      />
    </Box>
  );
};

export default Configuracoes;






