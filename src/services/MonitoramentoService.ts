import { Processo, Movimentacao } from '../types';
import { TribunalAPIService } from './TribunalAPIService';

interface ProcessoMonitorado {
  id: string;
  numero: string;
  tribunal: string;
  ultimaVerificacao: Date;
  ultimaMovimentacao: Date;
  movimentacoesConhecidas: string[];
  cliente: {
    nome: string;
    email: string;
    telefone: string;
  };
  advogadoResponsavel: string;
  status: 'monitorando' | 'pausado' | 'erro';
  proximaVerificacao: Date;
}

interface MudancaDetectada {
  processo: ProcessoMonitorado;
  tipo: 'nova_movimentacao' | 'status_alterado' | 'valor_alterado' | 'erro';
  descricao: string;
  dados: any;
  timestamp: Date;
}

export type { ProcessoMonitorado, MudancaDetectada };

export class MonitoramentoService {
  private static processosMonitorados: Map<string, ProcessoMonitorado> = new Map();
  private static intervalosVerificacao: Map<string, NodeJS.Timeout> = new Map();
  private static callbacksMudanca: Array<(mudanca: MudancaDetectada) => void> = [];

  /**
   * Inicia monitoramento de um processo
   */
  static async iniciarMonitoramento(
    numeroProcesso: string,
    cliente: { nome: string; email: string; telefone: string },
    advogadoResponsavel: string,
    intervaloMinutos: number = 30
  ): Promise<boolean> {
    try {
      console.log('🔍 Iniciando monitoramento para:', numeroProcesso);

      // Busca dados iniciais do processo
      const processoInicial = await TribunalAPIService.buscarProcessoEmTodosTribunais(numeroProcesso);
      
      if (!processoInicial) {
        console.log('❌ Processo não encontrado para monitoramento');
        return false;
      }

      // Cria registro de monitoramento
      const processoMonitorado: ProcessoMonitorado = {
        id: `monitor-${numeroProcesso}`,
        numero: numeroProcesso,
        tribunal: processoInicial.tribunal,
        ultimaVerificacao: new Date(),
        ultimaMovimentacao: processoInicial.dataUltimaMovimentacao,
        movimentacoesConhecidas: processoInicial.movimentacoes.map(m => `${m.data.getTime()}-${m.tipo}-${m.descricao}`),
        cliente,
        advogadoResponsavel,
        status: 'monitorando',
        proximaVerificacao: new Date(Date.now() + intervaloMinutos * 60 * 1000),
      };

      // Salva no mapa de monitoramento
      this.processosMonitorados.set(numeroProcesso, processoMonitorado);

      // Inicia verificação periódica
      this.iniciarVerificacaoPeriodica(numeroProcesso, intervaloMinutos);

      console.log('✅ Monitoramento iniciado para:', numeroProcesso);
      return true;

    } catch (error) {
      console.error('💥 Erro ao iniciar monitoramento:', error);
      return false;
    }
  }

  /**
   * Para monitoramento de um processo
   */
  static pararMonitoramento(numeroProcesso: string): boolean {
    try {
      console.log('⏹️ Parando monitoramento para:', numeroProcesso);

      // Remove do mapa
      this.processosMonitorados.delete(numeroProcesso);

      // Para o intervalo de verificação
      const intervalo = this.intervalosVerificacao.get(numeroProcesso);
      if (intervalo) {
        clearInterval(intervalo);
        this.intervalosVerificacao.delete(numeroProcesso);
      }

      console.log('✅ Monitoramento parado para:', numeroProcesso);
      return true;

    } catch (error) {
      console.error('💥 Erro ao parar monitoramento:', error);
      return false;
    }
  }

  /**
   * Inicia verificação periódica
   */
  private static iniciarVerificacaoPeriodica(numeroProcesso: string, intervaloMinutos: number): void {
    const intervalo = setInterval(async () => {
      await this.verificarMudancas(numeroProcesso);
    }, intervaloMinutos * 60 * 1000);

    this.intervalosVerificacao.set(numeroProcesso, intervalo);
  }

  /**
   * Verifica mudanças em um processo específico
   */
  private static async verificarMudancas(numeroProcesso: string): Promise<void> {
    try {
      console.log('🔍 Verificando mudanças para:', numeroProcesso);

      const processoMonitorado = this.processosMonitorados.get(numeroProcesso);
      if (!processoMonitorado) {
        console.log('❌ Processo não encontrado no monitoramento');
        return;
      }

      // Busca dados atualizados
      const processoAtualizado = await TribunalAPIService.buscarProcessoEmTodosTribunais(numeroProcesso);
      
      if (!processoAtualizado) {
        console.log('❌ Erro ao buscar dados atualizados');
        this.notificarMudanca({
          processo: processoMonitorado,
          tipo: 'erro',
          descricao: 'Erro ao buscar dados atualizados do processo',
          dados: null,
          timestamp: new Date(),
        });
        return;
      }

      // Verifica mudanças
      await this.compararProcessos(processoMonitorado, processoAtualizado);

      // Atualiza dados do monitoramento
      processoMonitorado.ultimaVerificacao = new Date();
      processoMonitorado.ultimaMovimentacao = processoAtualizado.dataUltimaMovimentacao;
      processoMonitorado.movimentacoesConhecidas = processoAtualizado.movimentacoes.map(
        m => `${m.data.getTime()}-${m.tipo}-${m.descricao}`
      );

    } catch (error) {
      console.error('💥 Erro ao verificar mudanças:', error);
    }
  }

  /**
   * Compara dois processos e detecta mudanças
   */
  private static async compararProcessos(
    processoMonitorado: ProcessoMonitorado,
    processoAtualizado: Processo
  ): Promise<void> {
    // Verifica novas movimentações
    const movimentacoesConhecidas = new Set(processoMonitorado.movimentacoesConhecidas);
    const novasMovimentacoes = processoAtualizado.movimentacoes.filter(
      mov => !movimentacoesConhecidas.has(`${mov.data.getTime()}-${mov.tipo}-${mov.descricao}`)
    );

    if (novasMovimentacoes.length > 0) {
      console.log('🆕 Novas movimentações detectadas:', novasMovimentacoes.length);
      
      for (const movimentacao of novasMovimentacoes) {
        this.notificarMudanca({
          processo: processoMonitorado,
          tipo: 'nova_movimentacao',
          descricao: `Nova movimentação: ${movimentacao.tipo} - ${movimentacao.descricao}`,
          dados: movimentacao,
          timestamp: new Date(),
        });
      }
    }

    // Verifica mudança de status
    if (processoMonitorado.status !== 'erro' && processoMonitorado.status !== 'pausado') {
      // Aqui seria uma comparação real de status se tivéssemos dados do processo atualizado
      // Por enquanto, apenas verificamos se há mudanças nas movimentações
      console.log('📊 Verificando mudanças de status...');
    }

    // Verifica mudança de valor da causa
    if (processoMonitorado.ultimaMovimentacao < processoAtualizado.dataUltimaMovimentacao) {
      console.log('💰 Possível mudança no valor da causa');
      
      this.notificarMudanca({
        processo: processoMonitorado,
        tipo: 'valor_alterado',
        descricao: 'Valor da causa pode ter sido alterado',
        dados: { valorAtual: processoAtualizado.valorCausa },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Notifica mudanças para todos os callbacks registrados
   */
  private static notificarMudanca(mudanca: MudancaDetectada): void {
    console.log('📢 Notificando mudança:', mudanca.descricao);
    
    this.callbacksMudanca.forEach(callback => {
      try {
        callback(mudanca);
      } catch (error) {
        console.error('💥 Erro ao executar callback de mudança:', error);
      }
    });
  }

  /**
   * Registra callback para receber notificações de mudanças
   */
  static onMudancaDetectada(callback: (mudanca: MudancaDetectada) => void): void {
    this.callbacksMudanca.push(callback);
  }

  /**
   * Remove callback de notificações
   */
  static removerCallbackMudanca(callback: (mudanca: MudancaDetectada) => void): void {
    const index = this.callbacksMudanca.indexOf(callback);
    if (index > -1) {
      this.callbacksMudanca.splice(index, 1);
    }
  }

  /**
   * Obtém lista de processos monitorados
   */
  static getProcessosMonitorados(): ProcessoMonitorado[] {
    return Array.from(this.processosMonitorados.values());
  }

  /**
   * Obtém processo monitorado específico
   */
  static getProcessoMonitorado(numeroProcesso: string): ProcessoMonitorado | null {
    return this.processosMonitorados.get(numeroProcesso) || null;
  }

  /**
   * Verifica se um processo está sendo monitorado
   */
  static isProcessoMonitorado(numeroProcesso: string): boolean {
    return this.processosMonitorados.has(numeroProcesso);
  }

  /**
   * Obtém estatísticas de monitoramento
   */
  static getEstatisticas(): {
    totalMonitorados: number;
    monitorando: number;
    pausados: number;
    comErro: number;
  } {
    const processos = Array.from(this.processosMonitorados.values());
    
    return {
      totalMonitorados: processos.length,
      monitorando: processos.filter(p => p.status === 'monitorando').length,
      pausados: processos.filter(p => p.status === 'pausado').length,
      comErro: processos.filter(p => p.status === 'erro').length,
    };
  }

  /**
   * Pausa monitoramento de um processo
   */
  static pausarMonitoramento(numeroProcesso: string): boolean {
    const processo = this.processosMonitorados.get(numeroProcesso);
    if (processo) {
      processo.status = 'pausado';
      return true;
    }
    return false;
  }

  /**
   * Retoma monitoramento de um processo
   */
  static retomarMonitoramento(numeroProcesso: string): boolean {
    const processo = this.processosMonitorados.get(numeroProcesso);
    if (processo) {
      processo.status = 'monitorando';
      return true;
    }
    return false;
  }
}








interface ProcessoMonitorado {
  id: string;
  numero: string;
  tribunal: string;
  ultimaVerificacao: Date;
  ultimaMovimentacao: Date;
  movimentacoesConhecidas: string[];
  cliente: {
    nome: string;
    email: string;
    telefone: string;
  };
  advogadoResponsavel: string;
  status: 'monitorando' | 'pausado' | 'erro';
  proximaVerificacao: Date;
}

interface MudancaDetectada {
  processo: ProcessoMonitorado;
  tipo: 'nova_movimentacao' | 'status_alterado' | 'valor_alterado' | 'erro';
  descricao: string;
  dados: any;
  timestamp: Date;
}

export type { ProcessoMonitorado, MudancaDetectada };

export class MonitoramentoService {
  private static processosMonitorados: Map<string, ProcessoMonitorado> = new Map();
  private static intervalosVerificacao: Map<string, NodeJS.Timeout> = new Map();
  private static callbacksMudanca: Array<(mudanca: MudancaDetectada) => void> = [];

  /**
   * Inicia monitoramento de um processo
   */
  static async iniciarMonitoramento(
    numeroProcesso: string,
    cliente: { nome: string; email: string; telefone: string },
    advogadoResponsavel: string,
    intervaloMinutos: number = 30
  ): Promise<boolean> {
    try {
      console.log('🔍 Iniciando monitoramento para:', numeroProcesso);

      // Busca dados iniciais do processo
      const processoInicial = await TribunalAPIService.buscarProcessoEmTodosTribunais(numeroProcesso);
      
      if (!processoInicial) {
        console.log('❌ Processo não encontrado para monitoramento');
        return false;
      }

      // Cria registro de monitoramento
      const processoMonitorado: ProcessoMonitorado = {
        id: `monitor-${numeroProcesso}`,
        numero: numeroProcesso,
        tribunal: processoInicial.tribunal,
        ultimaVerificacao: new Date(),
        ultimaMovimentacao: processoInicial.dataUltimaMovimentacao,
        movimentacoesConhecidas: processoInicial.movimentacoes.map(m => `${m.data.getTime()}-${m.tipo}-${m.descricao}`),
        cliente,
        advogadoResponsavel,
        status: 'monitorando',
        proximaVerificacao: new Date(Date.now() + intervaloMinutos * 60 * 1000),
      };

      // Salva no mapa de monitoramento
      this.processosMonitorados.set(numeroProcesso, processoMonitorado);

      // Inicia verificação periódica
      this.iniciarVerificacaoPeriodica(numeroProcesso, intervaloMinutos);

      console.log('✅ Monitoramento iniciado para:', numeroProcesso);
      return true;

    } catch (error) {
      console.error('💥 Erro ao iniciar monitoramento:', error);
      return false;
    }
  }

  /**
   * Para monitoramento de um processo
   */
  static pararMonitoramento(numeroProcesso: string): boolean {
    try {
      console.log('⏹️ Parando monitoramento para:', numeroProcesso);

      // Remove do mapa
      this.processosMonitorados.delete(numeroProcesso);

      // Para o intervalo de verificação
      const intervalo = this.intervalosVerificacao.get(numeroProcesso);
      if (intervalo) {
        clearInterval(intervalo);
        this.intervalosVerificacao.delete(numeroProcesso);
      }

      console.log('✅ Monitoramento parado para:', numeroProcesso);
      return true;

    } catch (error) {
      console.error('💥 Erro ao parar monitoramento:', error);
      return false;
    }
  }

  /**
   * Inicia verificação periódica
   */
  private static iniciarVerificacaoPeriodica(numeroProcesso: string, intervaloMinutos: number): void {
    const intervalo = setInterval(async () => {
      await this.verificarMudancas(numeroProcesso);
    }, intervaloMinutos * 60 * 1000);

    this.intervalosVerificacao.set(numeroProcesso, intervalo);
  }

  /**
   * Verifica mudanças em um processo específico
   */
  private static async verificarMudancas(numeroProcesso: string): Promise<void> {
    try {
      console.log('🔍 Verificando mudanças para:', numeroProcesso);

      const processoMonitorado = this.processosMonitorados.get(numeroProcesso);
      if (!processoMonitorado) {
        console.log('❌ Processo não encontrado no monitoramento');
        return;
      }

      // Busca dados atualizados
      const processoAtualizado = await TribunalAPIService.buscarProcessoEmTodosTribunais(numeroProcesso);
      
      if (!processoAtualizado) {
        console.log('❌ Erro ao buscar dados atualizados');
        this.notificarMudanca({
          processo: processoMonitorado,
          tipo: 'erro',
          descricao: 'Erro ao buscar dados atualizados do processo',
          dados: null,
          timestamp: new Date(),
        });
        return;
      }

      // Verifica mudanças
      await this.compararProcessos(processoMonitorado, processoAtualizado);

      // Atualiza dados do monitoramento
      processoMonitorado.ultimaVerificacao = new Date();
      processoMonitorado.ultimaMovimentacao = processoAtualizado.dataUltimaMovimentacao;
      processoMonitorado.movimentacoesConhecidas = processoAtualizado.movimentacoes.map(
        m => `${m.data.getTime()}-${m.tipo}-${m.descricao}`
      );

    } catch (error) {
      console.error('💥 Erro ao verificar mudanças:', error);
    }
  }

  /**
   * Compara dois processos e detecta mudanças
   */
  private static async compararProcessos(
    processoMonitorado: ProcessoMonitorado,
    processoAtualizado: Processo
  ): Promise<void> {
    // Verifica novas movimentações
    const movimentacoesConhecidas = new Set(processoMonitorado.movimentacoesConhecidas);
    const novasMovimentacoes = processoAtualizado.movimentacoes.filter(
      mov => !movimentacoesConhecidas.has(`${mov.data.getTime()}-${mov.tipo}-${mov.descricao}`)
    );

    if (novasMovimentacoes.length > 0) {
      console.log('🆕 Novas movimentações detectadas:', novasMovimentacoes.length);
      
      for (const movimentacao of novasMovimentacoes) {
        this.notificarMudanca({
          processo: processoMonitorado,
          tipo: 'nova_movimentacao',
          descricao: `Nova movimentação: ${movimentacao.tipo} - ${movimentacao.descricao}`,
          dados: movimentacao,
          timestamp: new Date(),
        });
      }
    }

    // Verifica mudança de status
    if (processoMonitorado.status !== 'erro' && processoMonitorado.status !== 'pausado') {
      // Aqui seria uma comparação real de status se tivéssemos dados do processo atualizado
      // Por enquanto, apenas verificamos se há mudanças nas movimentações
      console.log('📊 Verificando mudanças de status...');
    }

    // Verifica mudança de valor da causa
    if (processoMonitorado.ultimaMovimentacao < processoAtualizado.dataUltimaMovimentacao) {
      console.log('💰 Possível mudança no valor da causa');
      
      this.notificarMudanca({
        processo: processoMonitorado,
        tipo: 'valor_alterado',
        descricao: 'Valor da causa pode ter sido alterado',
        dados: { valorAtual: processoAtualizado.valorCausa },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Notifica mudanças para todos os callbacks registrados
   */
  private static notificarMudanca(mudanca: MudancaDetectada): void {
    console.log('📢 Notificando mudança:', mudanca.descricao);
    
    this.callbacksMudanca.forEach(callback => {
      try {
        callback(mudanca);
      } catch (error) {
        console.error('💥 Erro ao executar callback de mudança:', error);
      }
    });
  }

  /**
   * Registra callback para receber notificações de mudanças
   */
  static onMudancaDetectada(callback: (mudanca: MudancaDetectada) => void): void {
    this.callbacksMudanca.push(callback);
  }

  /**
   * Remove callback de notificações
   */
  static removerCallbackMudanca(callback: (mudanca: MudancaDetectada) => void): void {
    const index = this.callbacksMudanca.indexOf(callback);
    if (index > -1) {
      this.callbacksMudanca.splice(index, 1);
    }
  }

  /**
   * Obtém lista de processos monitorados
   */
  static getProcessosMonitorados(): ProcessoMonitorado[] {
    return Array.from(this.processosMonitorados.values());
  }

  /**
   * Obtém processo monitorado específico
   */
  static getProcessoMonitorado(numeroProcesso: string): ProcessoMonitorado | null {
    return this.processosMonitorados.get(numeroProcesso) || null;
  }

  /**
   * Verifica se um processo está sendo monitorado
   */
  static isProcessoMonitorado(numeroProcesso: string): boolean {
    return this.processosMonitorados.has(numeroProcesso);
  }

  /**
   * Obtém estatísticas de monitoramento
   */
  static getEstatisticas(): {
    totalMonitorados: number;
    monitorando: number;
    pausados: number;
    comErro: number;
  } {
    const processos = Array.from(this.processosMonitorados.values());
    
    return {
      totalMonitorados: processos.length,
      monitorando: processos.filter(p => p.status === 'monitorando').length,
      pausados: processos.filter(p => p.status === 'pausado').length,
      comErro: processos.filter(p => p.status === 'erro').length,
    };
  }

  /**
   * Pausa monitoramento de um processo
   */
  static pausarMonitoramento(numeroProcesso: string): boolean {
    const processo = this.processosMonitorados.get(numeroProcesso);
    if (processo) {
      processo.status = 'pausado';
      return true;
    }
    return false;
  }

  /**
   * Retoma monitoramento de um processo
   */
  static retomarMonitoramento(numeroProcesso: string): boolean {
    const processo = this.processosMonitorados.get(numeroProcesso);
    if (processo) {
      processo.status = 'monitorando';
      return true;
    }
    return false;
  }
}




