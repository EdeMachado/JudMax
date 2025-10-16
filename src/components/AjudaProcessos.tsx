import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import { Help, ContentCopy, Close } from '@mui/icons-material';
import { ProcessoExternoService } from '../services/ProcessoExternoService';
import toast from 'react-hot-toast';

interface AjudaProcessosProps {
  onProcessoSelecionado: (numero: string) => void;
}

const AjudaProcessos: React.FC<AjudaProcessosProps> = ({ onProcessoSelecionado }) => {
  const [open, setOpen] = useState(false);

  const processosDisponiveis = ProcessoExternoService.listarProcessosDisponiveis();

  const copiarNumero = (numero: string) => {
    navigator.clipboard.writeText(numero);
    toast.success('Número copiado para a área de transferência!');
  };

  const selecionarProcesso = (numero: string) => {
    onProcessoSelecionado(numero);
    setOpen(false);
    toast.success('Número do processo selecionado!');
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Help />}
        onClick={() => setOpen(true)}
        size="small"
        sx={{ mt: 1 }}
      >
        Processos para Teste
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Processos Disponíveis para Teste</Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Clique em um número para selecioná-lo automaticamente no formulário:
          </Typography>

          <Box mb={2} p={2} bgcolor="info.light" borderRadius={1}>
            <Typography variant="body2" color="info.contrastText">
              <strong>💡 Dica:</strong> Você pode digitar os números com ou sem pontos e hífens. 
              O sistema vai encontrar automaticamente!
            </Typography>
          </Box>

          <List>
            {processosDisponiveis.map((numero, index) => (
              <React.Fragment key={numero}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontFamily="monospace">
                          {numero}
                        </Typography>
                        <Chip label={`Processo ${index + 1}`} size="small" color="primary" />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Clique para usar este número no formulário
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => copiarNumero(numero)}
                      title="Copiar número"
                      size="small"
                    >
                      <ContentCopy />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < processosDisponiveis.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" color="text.secondary">
              <strong>Dica:</strong> Digite qualquer um desses números no campo "Número do Processo" 
              para ver a busca automática funcionando!
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AjudaProcessos;







  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import { Help, ContentCopy, Close } from '@mui/icons-material';
import { ProcessoExternoService } from '../services/ProcessoExternoService';
import toast from 'react-hot-toast';

interface AjudaProcessosProps {
  onProcessoSelecionado: (numero: string) => void;
}

const AjudaProcessos: React.FC<AjudaProcessosProps> = ({ onProcessoSelecionado }) => {
  const [open, setOpen] = useState(false);

  const processosDisponiveis = ProcessoExternoService.listarProcessosDisponiveis();

  const copiarNumero = (numero: string) => {
    navigator.clipboard.writeText(numero);
    toast.success('Número copiado para a área de transferência!');
  };

  const selecionarProcesso = (numero: string) => {
    onProcessoSelecionado(numero);
    setOpen(false);
    toast.success('Número do processo selecionado!');
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Help />}
        onClick={() => setOpen(true)}
        size="small"
        sx={{ mt: 1 }}
      >
        Processos para Teste
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Processos Disponíveis para Teste</Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Clique em um número para selecioná-lo automaticamente no formulário:
          </Typography>

          <Box mb={2} p={2} bgcolor="info.light" borderRadius={1}>
            <Typography variant="body2" color="info.contrastText">
              <strong>💡 Dica:</strong> Você pode digitar os números com ou sem pontos e hífens. 
              O sistema vai encontrar automaticamente!
            </Typography>
          </Box>

          <List>
            {processosDisponiveis.map((numero, index) => (
              <React.Fragment key={numero}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontFamily="monospace">
                          {numero}
                        </Typography>
                        <Chip label={`Processo ${index + 1}`} size="small" color="primary" />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Clique para usar este número no formulário
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => copiarNumero(numero)}
                      title="Copiar número"
                      size="small"
                    >
                      <ContentCopy />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < processosDisponiveis.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" color="text.secondary">
              <strong>Dica:</strong> Digite qualquer um desses números no campo "Número do Processo" 
              para ver a busca automática funcionando!
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AjudaProcessos;




