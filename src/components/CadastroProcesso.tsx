import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Close,
  Refresh,
  Person,
  Business,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { Processo } from '../types';
import { useProcessos } from '../hooks/useProcessos';
import { ProcessoExternoService } from '../services/ProcessoExternoService';
import { TribunalAPIService } from '../services/TribunalAPIService';
import { MonitoramentoService } from '../services/MonitoramentoService';
import { NotificacaoService } from '../services/NotificacaoService';
import MovimentacoesProcesso from './MovimentacoesProcesso';
import AjudaProcessos from './AjudaProcessos';
import toast from 'react-hot-toast';

interface CadastroProcessoProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (processo: Processo) => void;
}

interface FormData {
  numero: string;
  tipo: string;
  assunto: string;
  valorCausa: string;
  cliente: {
    nome: string;
    cpfCnpj: string;
    email: string;
    telefone: string;
  };
  advogadoResponsavel: string;
  tribunal: string;
  vara: string;
  observacoes: string;
}

const CadastroProcesso: React.FC<CadastroProcessoProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { adicionarProcesso, gerarNumeroProcesso, validarCpfCnpj, loading } = useProcessos();
  const [error, setError] = useState<string | null>(null);
  const [cpfCnpjError, setCpfCnpjError] = useState<string | null>(null);
  const [buscandoProcesso, setBuscandoProcesso] = useState(false);
  const [processoEncontrado, setProcessoEncontrado] = useState<Processo | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      numero: '',
      tipo: '',
      assunto: '',
      valorCausa: '',
      cliente: {
        nome: '',
        cpfCnpj: '',
        email: '',
        telefone: '',
      },
      advogadoResponsavel: '',
      tribunal: '',
      vara: '',
      observacoes: '',
    },
    mode: 'onChange',
  });

  const tipoSelecionado = watch('tipo');
  const tribunalSelecionado = watch('tribunal');

  const handleClose = () => {
    reset();
    setError(null);
    setCpfCnpjError(null);
    setProcessoEncontrado(null);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    onClose();
  };

  const selecionarProcesso = (numero: string) => {
    setValue('numero', numero);
    buscarProcessoExterno(numero);
  };

  const buscarProcessoExterno = async (numeroProcesso: string) => {
    console.log('🔍 CadastroProcesso.buscarProcessoExterno chamado com:', numeroProcesso);
    
    if (!numeroProcesso.trim()) {
      console.log('⚠️ Número vazio, cancelando busca');
      setProcessoEncontrado(null);
      return;
    }

    // Valida formato do número
    const isValid = TribunalAPIService.validarNumeroProcesso(numeroProcesso);
    console.log('✅ Validação do número:', isValid);
    
    if (!isValid) {
      console.log('❌ Formato inválido');
      toast.error('Formato do número do processo inválido');
      return;
    }

    console.log('📡 Iniciando busca nos tribunais...');
    setBuscandoProcesso(true);
    setError(null);

    try {
      console.log('📡 Chamando TribunalAPIService...');
      const processo = await TribunalAPIService.buscarProcessoEmTodosTribunais(numeroProcesso);
      console.log('📋 Resultado recebido:', processo);
      
      if (processo) {
        console.log('✅ Processo encontrado, preenchendo campos...');
        setProcessoEncontrado(processo);
        
        // Preenche automaticamente os campos
        setValue('numero', processo.numero);
        setValue('tipo', processo.tipo);
        setValue('assunto', processo.assunto);
        setValue('valorCausa', processo.valorCausa?.toString() || '');
        setValue('cliente.nome', processo.cliente.nome);
        setValue('cliente.cpfCnpj', processo.cliente.cpfCnpj);
        setValue('cliente.email', processo.cliente.email || '');
        setValue('cliente.telefone', processo.cliente.telefone || '');
        setValue('advogadoResponsavel', processo.advogadoResponsavel);
        setValue('tribunal', processo.tribunal);
        setValue('vara', processo.vara);
        setValue('observacoes', processo.observacoes || '');

        console.log('🎉 Campos preenchidos com sucesso!');
        toast.success('Processo encontrado! Campos preenchidos automaticamente.');
      } else {
        console.log('❌ Processo não encontrado');
        setProcessoEncontrado(null);
        toast.error('Processo não encontrado nos sistemas dos tribunais');
      }
    } catch (err) {
      console.error('💥 Erro na busca:', err);
      setError('Erro ao buscar processo externo');
      toast.error('Erro ao buscar processo');
    } finally {
      console.log('🏁 Finalizando busca...');
      setBuscandoProcesso(false);
    }
  };

  const handleGerarNumero = async () => {
    if (!tipoSelecionado || !tribunalSelecionado) {
      setError('Selecione o tipo e tribunal antes de gerar o número');
      return;
    }

    try {
      const numero = await gerarNumeroProcesso(tipoSelecionado, tribunalSelecionado);
      setValue('numero', numero);
    } catch (err) {
      setError('Erro ao gerar número do processo');
    }
  };

  const handleValidarCpfCnpj = (cpfCnpj: string) => {
    if (!cpfCnpj) {
      setCpfCnpjError(null);
      return;
    }

    const isValid = validarCpfCnpj(cpfCnpj);
    if (!isValid) {
      setCpfCnpjError('CPF ou CNPJ inválido');
    } else {
      setCpfCnpjError(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);

    try {
      const novoProcesso = await adicionarProcesso({
        numero: data.numero,
        tipo: data.tipo as any,
        status: 'ativo',
        assunto: data.assunto,
        valorCausa: data.valorCausa ? parseFloat(data.valorCausa) : undefined,
        dataDistribuicao: processoEncontrado?.dataDistribuicao || new Date(),
        dataUltimaMovimentacao: processoEncontrado?.dataUltimaMovimentacao || new Date(),
        cliente: {
          nome: data.cliente.nome,
          cpfCnpj: data.cliente.cpfCnpj,
          email: data.cliente.email || undefined,
          telefone: data.cliente.telefone || undefined,
        },
        advogadoResponsavel: data.advogadoResponsavel,
        tribunal: data.tribunal,
        vara: data.vara,
        observacoes: data.observacoes || undefined,
        movimentacoes: processoEncontrado?.movimentacoes || [],
        documentos: [],
      });

      onSuccess(novoProcesso);
      handleClose();
    } catch (err) {
      setError('Erro ao criar processo. Tente novamente.');
    }
  };

  const getVarasPorTribunal = (tribunal: string) => {
    const varasPorTribunal: Record<string, string[]> = {
      'TJSP': ['1ª Vara Cível', '2ª Vara Cível', '3ª Vara Cível', '1ª Vara Criminal', '2ª Vara Criminal'],
      'TRT2': ['1ª Vara do Trabalho', '2ª Vara do Trabalho', '3ª Vara do Trabalho'],
      'TJDFT': ['1ª Vara Cível', '2ª Vara Cível', '1ª Vara Criminal'],
      'STJ': ['1ª Turma', '2ª Turma', '3ª Turma'],
    };
    return varasPorTribunal[tribunal] || [];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Novo Processo</Typography>
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

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Número do Processo */}
            <Grid item xs={12} md={8}>
              <Controller
                name="numero"
                control={control}
                rules={{ required: 'Número do processo é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Número do Processo"
                    error={!!errors.numero}
                    helperText={errors.numero?.message}
                    placeholder="Ex: 0001234-56.2024.1.01.0001"
                    onChange={(e) => {
                      field.onChange(e);
                      // Limpa timeout anterior
                      if (timeoutId) {
                        clearTimeout(timeoutId);
                      }
                      // Busca automática quando o usuário para de digitar
                      const newTimeoutId = setTimeout(() => {
                        buscarProcessoExterno(e.target.value);
                      }, 1000);
                      setTimeoutId(newTimeoutId);
                    }}
                    InputProps={{
                      endAdornment: buscandoProcesso ? (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleGerarNumero}
                disabled={!tipoSelecionado || !tribunalSelecionado}
                sx={{ height: '56px' }}
              >
                Gerar Número
              </Button>
            </Grid>

            {/* Informações do Processo Encontrado */}
            {processoEncontrado && (
              <Grid item xs={12}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ✅ Processo encontrado nos sistemas externos!
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cliente:</strong> {processoEncontrado.cliente.nome} | 
                    <strong> Assunto:</strong> {processoEncontrado.assunto} | 
                    <strong> Movimentações:</strong> {processoEncontrado.movimentacoes.length} registros
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Tipo e Assunto */}
            <Grid item xs={12} md={6}>
              <Controller
                name="tipo"
                control={control}
                rules={{ required: 'Tipo é obrigatório' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.tipo}>
                    <InputLabel>Tipo</InputLabel>
                    <Select {...field} label="Tipo">
                      <MenuItem value="civel">Cível</MenuItem>
                      <MenuItem value="criminal">Criminal</MenuItem>
                      <MenuItem value="trabalhista">Trabalhista</MenuItem>
                      <MenuItem value="tributario">Tributário</MenuItem>
                      <MenuItem value="administrativo">Administrativo</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="assunto"
                control={control}
                rules={{ required: 'Assunto é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Assunto"
                    error={!!errors.assunto}
                    helperText={errors.assunto?.message}
                    placeholder="Ex: Ação de Cobrança"
                  />
                )}
              />
            </Grid>

            {/* Valor da Causa */}
            <Grid item xs={12} md={6}>
              <Controller
                name="valorCausa"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Valor da Causa"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    placeholder="0,00"
                  />
                )}
              />
            </Grid>

            {/* Tribunal e Vara */}
            <Grid item xs={12} md={6}>
              <Controller
                name="tribunal"
                control={control}
                rules={{ required: 'Tribunal é obrigatório' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.tribunal}>
                    <InputLabel>Tribunal</InputLabel>
                    <Select {...field} label="Tribunal">
                      <MenuItem value="TJSP">Tribunal de Justiça de SP</MenuItem>
                      <MenuItem value="TRT2">Tribunal Regional do Trabalho 2ª Região</MenuItem>
                      <MenuItem value="TJDFT">Tribunal de Justiça do DF</MenuItem>
                      <MenuItem value="STJ">Superior Tribunal de Justiça</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="vara"
                control={control}
                rules={{ required: 'Vara é obrigatória' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.vara}>
                    <InputLabel>Vara</InputLabel>
                    <Select {...field} label="Vara">
                      {getVarasPorTribunal(tribunalSelecionado).map((vara) => (
                        <MenuItem key={vara} value={vara}>
                          {vara}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Advogado Responsável */}
            <Grid item xs={12} md={6}>
              <Controller
                name="advogadoResponsavel"
                control={control}
                rules={{ required: 'Advogado responsável é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Advogado Responsável"
                    error={!!errors.advogadoResponsavel}
                    helperText={errors.advogadoResponsavel?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Dados do Cliente */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Dados do Cliente
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cliente.nome"
                control={control}
                rules={{ required: 'Nome do cliente é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nome do Cliente"
                    error={!!errors.cliente?.nome}
                    helperText={errors.cliente?.nome?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cliente.cpfCnpj"
                control={control}
                rules={{ 
                  required: 'CPF/CNPJ é obrigatório',
                  validate: (value) => validarCpfCnpj(value) || 'CPF/CNPJ inválido'
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="CPF/CNPJ"
                    error={!!errors.cliente?.cpfCnpj || !!cpfCnpjError}
                    helperText={errors.cliente?.cpfCnpj?.message || cpfCnpjError}
                    onChange={(e) => {
                      field.onChange(e);
                      handleValidarCpfCnpj(e.target.value);
                    }}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cliente.email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    placeholder="cliente@exemplo.com"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cliente.telefone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Telefone"
                    placeholder="(11) 99999-9999"
                  />
                )}
              />
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
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
                    placeholder="Informações adicionais sobre o processo..."
                  />
                )}
              />
            </Grid>

            {/* Movimentações do Processo Encontrado */}
            {processoEncontrado && processoEncontrado.movimentacoes.length > 0 && (
              <Grid item xs={12}>
                <MovimentacoesProcesso movimentacoes={processoEncontrado.movimentacoes} />
              </Grid>
            )}

            {/* Ajuda para Processos de Teste */}
            <Grid item xs={12}>
              <AjudaProcessos onProcessoSelecionado={selecionarProcesso} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Criando...' : 'Criar Processo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CadastroProcesso;






