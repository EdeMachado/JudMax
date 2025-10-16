import { useState, useCallback } from 'react';
import { 
  FinanceiroProcesso, 
  Honorario, 
  Despesa, 
  Pagamento, 
  RelatorioFinanceiro 
} from '../types';
import { FinanceiroService } from '../services/FinanceiroService';

export const useFinanceiro = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados financeiros de um processo
  const buscarFinanceiroProcesso = useCallback(async (processoId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.buscarFinanceiroProcesso(processoId);
    } catch (err) {
      setError('Erro ao buscar dados financeiros');
      console.error('Erro ao buscar dados financeiros:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar dados financeiros para um processo
  const criarFinanceiroProcesso = useCallback(async (processoId: string, valorCausa: number) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.criarFinanceiroProcesso(processoId, valorCausa);
    } catch (err) {
      setError('Erro ao criar dados financeiros');
      console.error('Erro ao criar dados financeiros:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar honorário
  const adicionarHonorario = useCallback(async (
    processoId: string, 
    honorario: Omit<Honorario, 'id'>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.adicionarHonorario(processoId, honorario);
    } catch (err) {
      setError('Erro ao adicionar honorário');
      console.error('Erro ao adicionar honorário:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar despesa
  const adicionarDespesa = useCallback(async (
    processoId: string, 
    despesa: Omit<Despesa, 'id'>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.adicionarDespesa(processoId, despesa);
    } catch (err) {
      setError('Erro ao adicionar despesa');
      console.error('Erro ao adicionar despesa:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar pagamento
  const adicionarPagamento = useCallback(async (
    processoId: string, 
    pagamento: Omit<Pagamento, 'id'>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.adicionarPagamento(processoId, pagamento);
    } catch (err) {
      setError('Erro ao adicionar pagamento');
      console.error('Erro ao adicionar pagamento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar todos os dados financeiros
  const buscarTodosFinanceiros = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.buscarTodosFinanceiros();
    } catch (err) {
      setError('Erro ao buscar dados financeiros');
      console.error('Erro ao buscar dados financeiros:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Gerar relatório financeiro
  const gerarRelatorioFinanceiro = useCallback(async (
    periodoInicio: Date, 
    periodoFim: Date
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.gerarRelatorioFinanceiro(periodoInicio, periodoFim);
    } catch (err) {
      setError('Erro ao gerar relatório financeiro');
      console.error('Erro ao gerar relatório financeiro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular honorários percentuais
  const calcularHonorarioPercentual = useCallback((valorCausa: number, percentual: number) => {
    return FinanceiroService.calcularHonorarioPercentual(valorCausa, percentual);
  }, []);

  // Buscar processos em atraso
  const buscarProcessosEmAtraso = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.buscarProcessosEmAtraso();
    } catch (err) {
      setError('Erro ao buscar processos em atraso');
      console.error('Erro ao buscar processos em atraso:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar status de honorário
  const atualizarStatusHonorario = useCallback(async (
    processoId: string, 
    honorarioId: string, 
    status: Honorario['status']
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.atualizarStatusHonorario(processoId, honorarioId, status);
    } catch (err) {
      setError('Erro ao atualizar status do honorário');
      console.error('Erro ao atualizar status do honorário:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar status de despesa
  const atualizarStatusDespesa = useCallback(async (
    processoId: string, 
    despesaId: string, 
    status: Despesa['status']
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.atualizarStatusDespesa(processoId, despesaId, status);
    } catch (err) {
      setError('Erro ao atualizar status da despesa');
      console.error('Erro ao atualizar status da despesa:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Excluir honorário
  const excluirHonorario = useCallback(async (honorarioId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.excluirHonorario(honorarioId);
    } catch (err) {
      setError('Erro ao excluir honorário');
      console.error('Erro ao excluir honorário:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Excluir despesa
  const excluirDespesa = useCallback(async (despesaId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.excluirDespesa(despesaId);
    } catch (err) {
      setError('Erro ao excluir despesa');
      console.error('Erro ao excluir despesa:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Excluir pagamento
  const excluirPagamento = useCallback(async (pagamentoId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await FinanceiroService.excluirPagamento(pagamentoId);
    } catch (err) {
      setError('Erro ao excluir pagamento');
      console.error('Erro ao excluir pagamento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    buscarFinanceiroProcesso,
    criarFinanceiroProcesso,
    adicionarHonorario,
    adicionarDespesa,
    adicionarPagamento,
    excluirHonorario,
    excluirDespesa,
    excluirPagamento,
    buscarTodosFinanceiros,
    gerarRelatorioFinanceiro,
    calcularHonorarioPercentual,
    buscarProcessosEmAtraso,
    atualizarStatusHonorario,
    atualizarStatusDespesa,
  };
};






