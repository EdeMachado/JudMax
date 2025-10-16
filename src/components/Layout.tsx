import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Chip,
  Paper,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Gavel,
  AttachMoney,
  Assessment,
  Settings,
  AccountCircle,
  Logout,
  MonitorHeart,
  FolderOpen,
  Notifications,
  Search,
  Brightness4,
  Brightness7,
  Help,
  Security,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProcessos } from '../hooks/useProcessos';
import { useFinanceiro } from '../hooks/useFinanceiro';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const { processos } = useProcessos();
  const { buscarTodosFinanceiros } = useFinanceiro();
  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    totalHonorarios: 0,
    totalDespesas: 0,
    totalRecebido: 0,
    saldoPendente: 0,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  // Carregar dados financeiros
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
        const saldoPendente = totalHonorarios + totalDespesas - totalRecebido;

        setDadosFinanceiros({
          totalHonorarios,
          totalDespesas,
          totalRecebido,
          saldoPendente,
        });
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
      }
    };

    carregarDadosFinanceiros();
  }, [buscarTodosFinanceiros]);

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <Dashboard />, 
      path: '/dashboard',
      badge: null,
      description: 'Visão geral do sistema'
    },
    { 
      text: 'Processos', 
      icon: <Gavel />, 
      path: '/processos',
      badge: processos.length.toString(),
      description: 'Gestão de processos judiciais'
    },
    { 
      text: 'Financeiro', 
      icon: <AttachMoney />, 
      path: '/financeiro',
      badge: `R$ ${dadosFinanceiros.saldoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      description: 'Controle financeiro'
    },
    { 
      text: 'Arquivo', 
      icon: <FolderOpen />, 
      path: '/arquivo',
      badge: processos.filter(p => p.status === 'arquivado').length.toString(),
      description: 'Processos arquivados'
    },
    { 
      text: 'Monitoramento', 
      icon: <MonitorHeart />, 
      path: '/monitoramento',
      badge: processos.filter(p => p.status === 'ativo').length.toString(),
      description: 'Monitoramento em tempo real'
    },
    { 
      text: 'Relatórios', 
      icon: <Assessment />, 
      path: '/relatorios',
      badge: null,
      description: 'Relatórios e análises'
    },
    { 
      text: 'Configurações', 
      icon: <Settings />, 
      path: '/configuracoes',
      badge: null,
      description: 'Configurações do sistema'
    },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo e Título */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 48, 
              height: 48, 
              mr: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <Gavel />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Sistema Judicial
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Controle de Processos
            </Typography>
          </Box>
        </Box>
        
        {/* Status do Sistema */}
        <Paper 
          sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #64748b 100%)',
            color: 'white'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Status do Sistema
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Online
              </Typography>
            </Box>
            <Chip 
              label="Ativo" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          </Box>
        </Paper>
      </Box>

      {/* Menu de Navegação */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, py: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #64748b 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #64748b 100%)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 'bold',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  }
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  secondary={item.description}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                {item.badge && (
                  <Chip 
                    label={item.badge} 
                    size="small" 
                    sx={{ 
                      ml: 1,
                      bgcolor: 'rgba(30, 58, 138, 0.1)',
                      color: '#1e3a8a',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      height: '24px',
                      border: '1px solid rgba(30, 58, 138, 0.2)',
                      '& .MuiChip-label': {
                        px: 1,
                      }
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Informações do Usuário */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
            <AccountCircle />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {usuario?.nome}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {usuario?.perfil}
            </Typography>
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Chip 
            label="Admin" 
            size="small" 
            color="primary" 
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip 
            label="Ativo" 
            size="small" 
            color="success" 
            sx={{ fontSize: '0.7rem' }}
          />
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #1e3a8a 0%, #64748b 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              Controle de Processos Judiciais
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Sistema Integrado de Gestão Jurídica
            </Typography>
          </Box>

          {/* Ações da Barra Superior */}
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton color="inherit" size="small">
              <Search />
            </IconButton>
            <IconButton color="inherit" size="small">
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <IconButton color="inherit" size="small">
              <Brightness4 />
            </IconButton>
            <IconButton color="inherit" size="small">
              <Help />
            </IconButton>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {usuario?.nome}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {usuario?.perfil}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Meu Perfil
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Security fontSize="small" />
              </ListItemIcon>
              Segurança
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Configurações
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Toolbar />
        <Box sx={{ 
          background: 'white', 
          borderRadius: 3, 
          p: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          minHeight: 'calc(100vh - 120px)'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;





