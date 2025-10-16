import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Processos from './pages/Processos';
import ProcessoDetalhes from './pages/ProcessoDetalhes';
import Relatorios from './pages/Relatorios';
import Financeiro from './pages/Financeiro';
import MonitoramentoProcessos from './pages/MonitoramentoProcessos';
import Configuracoes from './pages/Configuracoes';
import Arquivo from './pages/Arquivo';
import { AuthProvider, useAuth } from './hooks/useAuth';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/processos" element={<Processos />} />
                  <Route path="/processos/:id" element={<ProcessoDetalhes />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/arquivo" element={<Arquivo />} />
                  <Route path="/monitoramento" element={<MonitoramentoProcessos />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;






