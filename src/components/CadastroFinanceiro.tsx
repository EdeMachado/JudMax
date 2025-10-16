import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { Honorario, Despesa, Pagamento } from '../types';
import toast from 'react-hot-toast';

interface CadastroFinanceiroProps {
  open: boolean;
  onClose: () => void;
  tipo: 'honorario' | 'despesa' | 'pagamento';
  processoId: string;
  onSuccess: () => void;
}

// Tipos específicos para cada formulário
interface FormHonorario {
  tipo: string;
  descricao: string;
  valor: string;
  percentual: string;
  dataContratacao: string;
  dataVencimento: string;
  observacoes: string;
}

interface FormDespesa {
  tipo: string;
  descricao: string;
  valor: string;
  data: string;
  comprovante: string;
  reembolsavel: string;
}

interface FormPagamento {
  tipo: string;
  descricao: string;
  valor: string;
  dataPagamento: string;
  formaPagamento: string;
  comprovante: string;
  observacoes: string;
}

const CadastroFinanceiro: React.FC<CadastroFinanceiroProps> = ({
  open,
  onClose,
  tipo,
  processoId,
  onSuccess,
}) => {
  const { adicionarHonorario, adicionarDespesa, adicionarPagamento, calcularHonorarioPercentual } = useFinanceiro();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuração do formulário baseada no tipo
  const getDefaultValues = () => {
    switch (tipo) {
      case 'honorario':
        return {
          tipo: 'contratual',
          descricao: '',
          valor: '',
          percentual: '',
          dataContratacao: new Date().toISOString().split('T')[0],
          dataVencimento: '',
          observacoes: '',
        };
      case 'despesa':
        return {
          tipo: 'custas',
          descricao: '',
          valor: '',
          data: new Date().toISOString().split('T')[0],
          comprovante: '',
          reembolsavel: 'true',
        };
      case 'pagamento':
        return {
          tipo: 'honorario',
          descricao: '',
          valor: '',
          dataPagamento: new Date().toISOString().split('T')[0],
          formaPagamento: 'dinheiro',
          comprovante: '',
          observacoes: '',
        };
      default:
        return {};
    }
  };

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<any>({
    defaultValues: getDefaultValues(),
  });

  // Observar mudanças no tipo de honorário para calcular valor automaticamente
  const tipoHonorario = watch('tipo');
  const percentual = watch('percentual');

  useEffect(() => {
    if (tipo === 'honorario' && tipoHonorario === 'percentual' && percentual) {
      const valorCalculado = calcularHonorarioPercentual(parseFloat(percentual), 1000); // Valor base padrão
      setValue('valor', valorCalculado.toString());
    }
  }, [tipoHonorario, percentual, tipo, calcularHonorarioPercentual, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      switch (tipo) {
        case 'honorario':
          await adicionarHonorario(processoId, {
            tipo: data.tipo as any,
            descricao: data.descricao,
            valor: parseFloat(data.valor),
            percentual: data.percentual ? parseFloat(data.percentual) : undefined,
            dataContratacao: new Date(data.dataContratacao),
            dataVencimento: data.dataVencimento ? new Date(data.dataVencimento) : undefined,
            status: 'pendente',
            observacoes: data.observacoes || undefined,
          });
          break;

        case 'despesa':
          await adicionarDespesa(processoId, {
            tipo: data.tipo as any,
            descricao: data.descricao,
            valor: parseFloat(data.valor),
            data: new Date(data.data),
            comprovante: data.comprovante || undefined,
            reembolsavel: data.reembolsavel === 'true',
            status: 'pendente',
          });
          break;

        case 'pagamento':
          await adicionarPagamento(processoId, {
            tipo: data.tipo as any,
            descricao: data.descricao,
            valor: parseFloat(data.valor),
            dataPagamento: new Date(data.dataPagamento),
            formaPagamento: data.formaPagamento as any,
            comprovante: data.comprovante || undefined,
            observacoes: data.observacoes || undefined,
          });
          break;
      }

      toast.success(`${tipo === 'honorario' ? 'Honorário' : tipo === 'despesa' ? 'Despesa' : 'Pagamento'} adicionado com sucesso!`);
      onSuccess();
      handleClose();
    } catch (err) {
      setError('Erro ao adicionar item. Tente novamente.');
      toast.error('Erro ao adicionar item.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const getTitulo = () => {
    switch (tipo) {
      case 'honorario': return 'Adicionar Honorário';
      case 'despesa': return 'Adicionar Despesa';
      case 'pagamento': return 'Registrar Pagamento';
      default: return 'Adicionar Item';
    }
  };

  const getCamposEspecificos = () => {
    switch (tipo) {
      case 'honorario':
        return (
          <>
            <Controller
              name="tipo"
              control={control}
              rules={{ required: 'Tipo de honorário é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo}>
                  <InputLabel>Tipo de Honorário</InputLabel>
                  <Select {...field} label="Tipo de Honorário">
                    <MenuItem value="contratual">Contratual</MenuItem>
                    <MenuItem value="successio_nominis">Successio Nominis</MenuItem>
                    <MenuItem value="arbitrado">Arbitrado</MenuItem>
                    <MenuItem value="fixo">Fixo</MenuItem>
                    <MenuItem value="percentual">Percentual</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="descricao"
              control={control}
              rules={{ required: 'Descrição é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Descrição"
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message as string}
                />
              )}
            />

            {tipoHonorario === 'percentual' && (
              <Controller
                name="percentual"
                control={control}
                rules={{ required: 'Percentual é obrigatório para honorários percentuais' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Percentual"
                    type="number"
                    error={!!errors.percentual}
                    helperText={errors.percentual?.message as string}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                )}
              />
            )}

            <Controller
              name="valor"
              control={control}
              rules={{ required: 'Valor é obrigatório' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Valor"
                  type="number"
                  error={!!errors.valor}
                  helperText={errors.valor?.message as string}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              )}
            />

            <Controller
              name="dataContratacao"
              control={control}
              rules={{ required: 'Data de contratação é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Data de Contratação"
                  type="date"
                  error={!!errors.dataContratacao}
                  helperText={errors.dataContratacao?.message as string}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="dataVencimento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Data de Vencimento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                />
              )}
            />
          </>
        );

      case 'despesa':
        return (
          <>
            <Controller
              name="tipo"
              control={control}
              rules={{ required: 'Tipo de despesa é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo}>
                  <InputLabel>Tipo de Despesa</InputLabel>
                  <Select {...field} label="Tipo de Despesa">
                    <MenuItem value="custas">Custas</MenuItem>
                    <MenuItem value="pericia">Perícia</MenuItem>
                    <MenuItem value="documentos">Documentos</MenuItem>
                    <MenuItem value="correios">Correios</MenuItem>
                    <MenuItem value="outros">Outros</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="descricao"
              control={control}
              rules={{ required: 'Descrição é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Descrição"
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message as string}
                />
              )}
            />

            <Controller
              name="valor"
              control={control}
              rules={{ required: 'Valor é obrigatório' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Valor"
                  type="number"
                  error={!!errors.valor}
                  helperText={errors.valor?.message as string}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              )}
            />

            <Controller
              name="data"
              control={control}
              rules={{ required: 'Data é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Data"
                  type="date"
                  error={!!errors.data}
                  helperText={errors.data?.message as string}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="comprovante"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Comprovante"
                />
              )}
            />

            <Controller
              name="reembolsavel"
              control={control}
              rules={{ required: 'Campo reembolsável é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.reembolsavel}>
                  <InputLabel>Reembolsável</InputLabel>
                  <Select {...field} label="Reembolsável">
                    <MenuItem value="true">Sim</MenuItem>
                    <MenuItem value="false">Não</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </>
        );

      case 'pagamento':
        return (
          <>
            <Controller
              name="tipo"
              control={control}
              rules={{ required: 'Tipo de pagamento é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo}>
                  <InputLabel>Tipo de Pagamento</InputLabel>
                  <Select {...field} label="Tipo de Pagamento">
                    <MenuItem value="honorario">Honorário</MenuItem>
                    <MenuItem value="despesa">Despesa</MenuItem>
                    <MenuItem value="adiantamento">Adiantamento</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="descricao"
              control={control}
              rules={{ required: 'Descrição é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Descrição"
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message as string}
                />
              )}
            />

            <Controller
              name="valor"
              control={control}
              rules={{ required: 'Valor é obrigatório' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Valor"
                  type="number"
                  error={!!errors.valor}
                  helperText={errors.valor?.message as string}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              )}
            />

            <Controller
              name="dataPagamento"
              control={control}
              rules={{ required: 'Data de pagamento é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Data de Pagamento"
                  type="date"
                  error={!!errors.dataPagamento}
                  helperText={errors.dataPagamento?.message as string}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="formaPagamento"
              control={control}
              rules={{ required: 'Forma de pagamento é obrigatória' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.formaPagamento}>
                  <InputLabel>Forma de Pagamento</InputLabel>
                  <Select {...field} label="Forma de Pagamento">
                    <MenuItem value="dinheiro">Dinheiro</MenuItem>
                    <MenuItem value="transferencia">Transferência</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                    <MenuItem value="cartao">Cartão</MenuItem>
                    <MenuItem value="pix">PIX</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="comprovante"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Comprovante"
                />
              )}
            />

            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                />
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{getTitulo()}</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          {getCamposEspecificos()}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CadastroFinanceiro;






  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { Honorario, Despesa, Pagamento } from '../types';
import toast from 'react-hot-toast';

interface CadastroFinanceiroProps {
  open: boolean;
  onClose: () => void;
  tipo: 'honorario' | 'despesa' | 'pagamento';
  processoId: string;
  onSuccess: () => void;
}

// Tipos específicos para cada formulário
interface FormHonorario {
  tipo: string;
  descricao: string;
  valor: string;
  percentual: string;
  dataContratacao: string;
  dataVencimento: string;
  observacoes: string;
}

interface FormDespesa {
  tipo: string;
  descricao: string;
  valor: string;
  data: string;
  comprovante: string;
  reembolsavel: string;
}

interface FormPagamento {
  tipo: string;
  descricao: string;
  valor: string;
  dataPagamento: string;
  formaPagamento: string;
  comprovante: string;
  observacoes: string;
}

const CadastroFinanceiro: React.FC<CadastroFinanceiroProps> = ({
  open,
  onClose,
  tipo,
  processoId,
  onSuccess,
}) => {
  const { adicionarHonorario, adicionarDespesa, adicionarPagamento, calcularHonorarioPercentual } = useFinanceiro();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuração do formulário baseada no tipo
  const getDefaultValues = () => {
    switch (tipo) {
      case 'honorario':
        return {
          tipo: 'contratual',
          descricao: '',
          valor: '',
          percentual: '',
          dataContratacao: new Date().toISOString().split('T')[0],
          dataVencimento: '',
          observacoes: '',
        };
      case 'despesa':
        return {
          tipo: 'custas',
          descricao: '',
          valor: '',
          data: new Date().toISOString().split('T')[0],
          comprovante: '',
          reembolsavel: 'true',
        };
      case 'pagamento':
        return {
          tipo: 'honorario',
          descricao: '',
          valor: '',
          dataPagamento: new Date().toISOString().split('T')[0],
          formaPagamento: 'dinheiro',
          comprovante: '',
          observacoes: '',
        };
      default:
        return {};
    }
  };

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<any>({
    defaultValues: getDefaultValues(),
  });

  // Observar mudanças no tipo de honorário para calcular valor automaticamente
  const tipoHonorario = watch('tipo');
  const percentual = watch('percentual');

  useEffect(() => {
    if (tipo === 'honorario' && tipoHonorario === 'percentual' && percentual) {
      const valorCalculado = calcularHonorarioPercentual(parseFloat(percentual), 1000); // Valor base padrão
      setValue('valor', valorCalculado.toString());
    }
  }, [tipoHonorario, percentual, tipo, calcularHonorarioPercentual, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      switch (tipo) {
        case 'honorario':
          await adicionarHonorario(processoId, {
            tipo: data.tipo as any,
            descricao: data.descricao,
            valor: parseFloat(data.valor),
            percentual: data.percentual ? parseFloat(data.percentual) : undefined,
            dataContratacao: new Date(data.dataContratacao),
            dataVencimento: data.dataVencimento ? new Date(data.dataVencimento) : undefined,
            status: 'pendente',
            observacoes: data.observacoes || undefined,
          });
          break;

        case 'despesa':
          await adicionarDespesa(processoId, {
            tipo: data.tipo as any,
            descricao: data.descricao,
            valor: parseFloat(data.valor),
            data: new Date(data.data),
            comprovante: data.comprovante || undefined,
            reembolsavel: data.reembolsavel === 'true',
            status: 'pendente',
          });
          break;

        case 'pagamento':
          await adicionarPagamento(processoId, {
            tipo: data.tipo as any,
            descricao: data.descricao,
            valor: parseFloat(data.valor),
            dataPagamento: new Date(data.dataPagamento),
            formaPagamento: data.formaPagamento as any,
            comprovante: data.comprovante || undefined,
            observacoes: data.observacoes || undefined,
          });
          break;
      }

      toast.success(`${tipo === 'honorario' ? 'Honorário' : tipo === 'despesa' ? 'Despesa' : 'Pagamento'} adicionado com sucesso!`);
      onSuccess();
      handleClose();
    } catch (err) {
      setError('Erro ao adicionar item. Tente novamente.');
      toast.error('Erro ao adicionar item.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const getTitulo = () => {
    switch (tipo) {
      case 'honorario': return 'Adicionar Honorário';
      case 'despesa': return 'Adicionar Despesa';
      case 'pagamento': return 'Registrar Pagamento';
      default: return 'Adicionar Item';
    }
  };

  const getCamposEspecificos = () => {
    switch (tipo) {
      case 'honorario':
        return (
          <>
            <Controller
              name="tipo"
              control={control}
              rules={{ required: 'Tipo de honorário é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo}>
                  <InputLabel>Tipo de Honorário</InputLabel>
                  <Select {...field} label="Tipo de Honorário">
                    <MenuItem value="contratual">Contratual</MenuItem>
                    <MenuItem value="successio_nominis">Successio Nominis</MenuItem>
                    <MenuItem value="arbitrado">Arbitrado</MenuItem>
                    <MenuItem value="fixo">Fixo</MenuItem>
                    <MenuItem value="percentual">Percentual</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="descricao"
              control={control}
              rules={{ required: 'Descrição é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Descrição"
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message as string}
                />
              )}
            />

            {tipoHonorario === 'percentual' && (
              <Controller
                name="percentual"
                control={control}
                rules={{ required: 'Percentual é obrigatório para honorários percentuais' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Percentual"
                    type="number"
                    error={!!errors.percentual}
                    helperText={errors.percentual?.message as string}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                )}
              />
            )}

            <Controller
              name="valor"
              control={control}
              rules={{ required: 'Valor é obrigatório' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Valor"
                  type="number"
                  error={!!errors.valor}
                  helperText={errors.valor?.message as string}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              )}
            />

            <Controller
              name="dataContratacao"
              control={control}
              rules={{ required: 'Data de contratação é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Data de Contratação"
                  type="date"
                  error={!!errors.dataContratacao}
                  helperText={errors.dataContratacao?.message as string}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="dataVencimento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Data de Vencimento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                />
              )}
            />
          </>
        );

      case 'despesa':
        return (
          <>
            <Controller
              name="tipo"
              control={control}
              rules={{ required: 'Tipo de despesa é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo}>
                  <InputLabel>Tipo de Despesa</InputLabel>
                  <Select {...field} label="Tipo de Despesa">
                    <MenuItem value="custas">Custas</MenuItem>
                    <MenuItem value="pericia">Perícia</MenuItem>
                    <MenuItem value="documentos">Documentos</MenuItem>
                    <MenuItem value="correios">Correios</MenuItem>
                    <MenuItem value="outros">Outros</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="descricao"
              control={control}
              rules={{ required: 'Descrição é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Descrição"
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message as string}
                />
              )}
            />

            <Controller
              name="valor"
              control={control}
              rules={{ required: 'Valor é obrigatório' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Valor"
                  type="number"
                  error={!!errors.valor}
                  helperText={errors.valor?.message as string}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              )}
            />

            <Controller
              name="data"
              control={control}
              rules={{ required: 'Data é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Data"
                  type="date"
                  error={!!errors.data}
                  helperText={errors.data?.message as string}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="comprovante"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Comprovante"
                />
              )}
            />

            <Controller
              name="reembolsavel"
              control={control}
              rules={{ required: 'Campo reembolsável é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.reembolsavel}>
                  <InputLabel>Reembolsável</InputLabel>
                  <Select {...field} label="Reembolsável">
                    <MenuItem value="true">Sim</MenuItem>
                    <MenuItem value="false">Não</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </>
        );

      case 'pagamento':
        return (
          <>
            <Controller
              name="tipo"
              control={control}
              rules={{ required: 'Tipo de pagamento é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo}>
                  <InputLabel>Tipo de Pagamento</InputLabel>
                  <Select {...field} label="Tipo de Pagamento">
                    <MenuItem value="honorario">Honorário</MenuItem>
                    <MenuItem value="despesa">Despesa</MenuItem>
                    <MenuItem value="adiantamento">Adiantamento</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="descricao"
              control={control}
              rules={{ required: 'Descrição é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Descrição"
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message as string}
                />
              )}
            />

            <Controller
              name="valor"
              control={control}
              rules={{ required: 'Valor é obrigatório' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Valor"
                  type="number"
                  error={!!errors.valor}
                  helperText={errors.valor?.message as string}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              )}
            />

            <Controller
              name="dataPagamento"
              control={control}
              rules={{ required: 'Data de pagamento é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Data de Pagamento"
                  type="date"
                  error={!!errors.dataPagamento}
                  helperText={errors.dataPagamento?.message as string}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="formaPagamento"
              control={control}
              rules={{ required: 'Forma de pagamento é obrigatória' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.formaPagamento}>
                  <InputLabel>Forma de Pagamento</InputLabel>
                  <Select {...field} label="Forma de Pagamento">
                    <MenuItem value="dinheiro">Dinheiro</MenuItem>
                    <MenuItem value="transferencia">Transferência</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                    <MenuItem value="cartao">Cartão</MenuItem>
                    <MenuItem value="pix">PIX</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="comprovante"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Comprovante"
                />
              )}
            />

            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                />
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{getTitulo()}</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          {getCamposEspecificos()}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CadastroFinanceiro;



