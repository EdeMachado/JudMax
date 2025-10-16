import { 
  FinanceiroProcesso, 
  Honorario, 
  Despesa, 
  Pagamento, 
  RelatorioFinanceiro 
} from '../types';

// Simulação de dados em memória
let financeiroData: FinanceiroProcesso[] = [];

let nextFinanceiroId = 1;
let nextHonorarioId = 1;
let nextDespesaId = 1;
let nextPagamentoId = 1;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class FinanceiroService {
  // Buscar dados financeiros de um processo
  static async buscarFinanceiroProcesso(processoId: string): Promise<FinanceiroProcesso | null> {
    await delay(300);
    return financeiroData.find(f => f.processoId === processoId) || null;
  }

  // Criar dados financeiros para um processo
  static async criarFinanceiroProcesso(processoId: string, valorCausa: number): Promise<FinanceiroProcesso> {
    await delay(500);
    
    const novoFinanceiro: FinanceiroProcesso = {
      id: nextFinanceiroId.toString(),
      processoId,
      valorCausa,
      honorarios: [],
      despesas: [],
      pagamentos: [],
      saldoDevedor: 0,
      saldoReceber: 0,
      statusFinanceiro: 'em_aberto',
    };

    financeiroData.push(novoFinanceiro);
    nextFinanceiroId++;
    
    return novoFinanceiro;
  }

  // Adicionar honorário
  static async adicionarHonorario(
    processoId: string, 
    honorario: Omit<Honorario, 'id'>
  ): Promise<Honorario | null> {
    await delay(400);
    
    const financeiro = financeiroData.find(f => f.processoId === processoId);
    if (!financeiro) return null;

    const novoHonorario: Honorario = {
      ...honorario,
      id: nextHonorarioId.toString(),
    };

    financeiro.honorarios.push(novoHonorario);
    this.calcularSaldos(financeiro);
    nextHonorarioId++;
    
    return novoHonorario;
  }

  // Adicionar despesa
  static async adicionarDespesa(
    processoId: string, 
    despesa: Omit<Despesa, 'id'>
  ): Promise<Despesa | null> {
    await delay(400);
    
    const financeiro = financeiroData.find(f => f.processoId === processoId);
    if (!financeiro) return null;

    const novaDespesa: Despesa = {
      ...despesa,
      id: nextDespesaId.toString(),
    };

    financeiro.despesas.push(novaDespesa);
    this.calcularSaldos(financeiro);
    nextDespesaId++;
    
    return novaDespesa;
  }

  // Adicionar pagamento
  static async adicionarPagamento(
    processoId: string, 
    pagamento: Omit<Pagamento, 'id'>
  ): Promise<Pagamento | null> {
    await delay(400);
    
    const financeiro = financeiroData.find(f => f.processoId === processoId);
    if (!financeiro) return null;

    const novoPagamento: Pagamento = {
      ...pagamento,
      id: nextPagamentoId.toString(),
    };

    financeiro.pagamentos.push(novoPagamento);
    this.calcularSaldos(financeiro);
    nextPagamentoId++;
    
    return novoPagamento;
  }

  // Calcular saldos
  private static calcularSaldos(financeiro: FinanceiroProcesso) {
    const totalHonorarios = financeiro.honorarios.reduce((sum, h) => sum + h.valor, 0);
    const totalDespesas = financeiro.despesas.reduce((sum, d) => sum + d.valor, 0);
    const totalPagamentos = financeiro.pagamentos.reduce((sum, p) => sum + p.valor, 0);
    
    financeiro.saldoReceber = totalHonorarios + totalDespesas - totalPagamentos;
    financeiro.saldoDevedor = Math.max(0, totalPagamentos - totalHonorarios - totalDespesas);
    
    // Atualizar status financeiro
    if (financeiro.saldoReceber <= 0) {
      financeiro.statusFinanceiro = 'quitado';
    } else if (totalPagamentos > 0) {
      financeiro.statusFinanceiro = 'parcialmente_pago';
    } else {
      financeiro.statusFinanceiro = 'em_aberto';
    }
  }

  // Buscar todos os dados financeiros
  static async buscarTodosFinanceiros(): Promise<FinanceiroProcesso[]> {
    await delay(300);
    return [...financeiroData];
  }

  // Gerar relatório financeiro
  static async gerarRelatorioFinanceiro(
    periodoInicio: Date, 
    periodoFim: Date
  ): Promise<RelatorioFinanceiro> {
    await delay(500);
    
    const financeiros = financeiroData.filter(f => {
      const dataProcesso = f.honorarios[0]?.dataContratacao || new Date();
      return dataProcesso >= periodoInicio && dataProcesso <= periodoFim;
    });

    const totalHonorarios = financeiros.reduce((sum, f) => 
      sum + f.honorarios.reduce((s, h) => s + h.valor, 0), 0
    );
    
    const totalDespesas = financeiros.reduce((sum, f) => 
      sum + f.despesas.reduce((s, d) => s + d.valor, 0), 0
    );
    
    const totalRecebido = financeiros.reduce((sum, f) => 
      sum + f.pagamentos.reduce((s, p) => s + p.valor, 0), 0
    );

    const processos = financeiros.map(f => ({
      processoId: f.processoId,
      numero: `Processo ${f.processoId}`, // Em produção seria buscado do processo
      cliente: `Cliente ${f.processoId}`, // Em produção seria buscado do processo
      honorarios: f.honorarios.reduce((sum, h) => sum + h.valor, 0),
      despesas: f.despesas.reduce((sum, d) => sum + d.valor, 0),
      recebido: f.pagamentos.reduce((sum, p) => sum + p.valor, 0),
      saldo: f.saldoReceber,
    }));

    return {
      id: '1',
      periodoInicio,
      periodoFim,
      totalHonorarios,
      totalDespesas,
      totalRecebido,
      saldoPendente: totalHonorarios + totalDespesas - totalRecebido,
      processos,
    };
  }

  // Calcular honorários percentuais
  static calcularHonorarioPercentual(valorCausa: number, percentual: number): number {
    return (valorCausa * percentual) / 100;
  }

  // Buscar processos em atraso
  static async buscarProcessosEmAtraso(): Promise<FinanceiroProcesso[]> {
    await delay(300);
    const hoje = new Date();
    
    return financeiroData.filter(f => {
      const temVencimento = f.honorarios.some(h => 
        h.dataVencimento && h.dataVencimento < hoje && h.status !== 'pago'
      );
      return temVencimento && f.statusFinanceiro !== 'quitado';
    });
  }

  // Atualizar status de honorário
  static async atualizarStatusHonorario(
    processoId: string, 
    honorarioId: string, 
    status: Honorario['status']
  ): Promise<boolean> {
    await delay(300);
    
    const financeiro = financeiroData.find(f => f.processoId === processoId);
    if (!financeiro) return false;

    const honorario = financeiro.honorarios.find(h => h.id === honorarioId);
    if (!honorario) return false;

    honorario.status = status;
    this.calcularSaldos(financeiro);
    
    return true;
  }

  // Atualizar status de despesa
  static async atualizarStatusDespesa(
    processoId: string, 
    despesaId: string, 
    status: Despesa['status']
  ): Promise<boolean> {
    await delay(300);
    
    const financeiro = financeiroData.find(f => f.processoId === processoId);
    if (!financeiro) return false;

    const despesa = financeiro.despesas.find(d => d.id === despesaId);
    if (!despesa) return false;

    despesa.status = status;
    this.calcularSaldos(financeiro);
    
    return true;
  }

  // Excluir honorário
  static async excluirHonorario(honorarioId: string): Promise<boolean> {
    await delay(300);
    
    for (const financeiro of financeiroData) {
      const index = financeiro.honorarios.findIndex(h => h.id === honorarioId);
      if (index !== -1) {
        financeiro.honorarios.splice(index, 1);
        this.calcularSaldos(financeiro);
        return true;
      }
    }
    
    return false;
  }

  // Excluir despesa
  static async excluirDespesa(despesaId: string): Promise<boolean> {
    await delay(300);
    
    for (const financeiro of financeiroData) {
      const index = financeiro.despesas.findIndex(d => d.id === despesaId);
      if (index !== -1) {
        financeiro.despesas.splice(index, 1);
        this.calcularSaldos(financeiro);
        return true;
      }
    }
    
    return false;
  }

  // Excluir pagamento
  static async excluirPagamento(pagamentoId: string): Promise<boolean> {
    await delay(300);
    
    for (const financeiro of financeiroData) {
      const index = financeiro.pagamentos.findIndex(p => p.id === pagamentoId);
      if (index !== -1) {
        financeiro.pagamentos.splice(index, 1);
        this.calcularSaldos(financeiro);
        return true;
      }
    }
    
    return false;
  }
}






