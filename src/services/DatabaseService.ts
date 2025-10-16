/**
 * Serviço para gerenciar o banco de dados local (localStorage)
 */
export class DatabaseService {
  private static readonly STORAGE_KEYS = {
    PROCESSOS: 'processos-judiciais',
    FINANCEIRO: 'financeiro-processos',
    USUARIOS: 'usuarios-sistema',
    CONFIGURACOES: 'configuracoes-sistema',
    MONITORAMENTO: 'processos-monitoramento'
  };

  /**
   * Limpa todos os dados do banco de dados
   */
  static limparBancoCompleto(): void {
    console.log('🗑️ Limpando banco de dados completo...');
    
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ Removido: ${key}`);
    });

    // Limpa também outras chaves que possam existir
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('processo') || 
        key.includes('financeiro') || 
        key.includes('usuario') ||
        key.includes('config') ||
        key.includes('monitor')
      )) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ Removido adicional: ${key}`);
    });

    console.log('🎉 Banco de dados limpo com sucesso!');
  }

  /**
   * Limpa apenas dados específicos
   */
  static limparDadosEspecificos(tipo: 'processos' | 'financeiro' | 'usuarios' | 'configuracoes' | 'monitoramento'): void {
    console.log(`🗑️ Limpando dados de: ${tipo}`);
    
    const key = this.STORAGE_KEYS[tipo.toUpperCase() as keyof typeof this.STORAGE_KEYS];
    if (key) {
      localStorage.removeItem(key);
      console.log(`✅ Removido: ${key}`);
    }
  }

  /**
   * Limpa apenas processos fictícios (mantém os reais)
   */
  static limparProcessosFicticios(): void {
    console.log('🗑️ Limpando apenas processos fictícios...');
    
    const processosData = localStorage.getItem(this.STORAGE_KEYS.PROCESSOS);
    if (!processosData) {
      console.log('ℹ️ Nenhum processo encontrado');
      return;
    }

    try {
      const processos = JSON.parse(processosData);
      const processosReais = processos.filter((processo: any) => {
        // Processos fictícios têm características específicas
        const observacoes = processo.observacoes || '';
        const cliente = processo.cliente?.nome || '';
        const assunto = processo.assunto || '';
        
        // Identifica processos fictícios por padrões conhecidos
        const isFicticio = 
          cliente.includes('Empresa ABC') ||
          cliente.includes('João Silva') ||
          cliente.includes('Maria Santos') ||
          cliente.includes('José da Silva') ||
          cliente.includes('Carlos Oliveira') ||
          assunto.includes('Cobrança de Dívida') ||
          assunto.includes('Exemplo') ||
          assunto.includes('Ação de Cobrança') ||
          assunto.includes('Reclamação Trabalhista') ||
          assunto.includes('Ação Penal') ||
          processo.numero.includes('123456') ||
          processo.numero.includes('0001234') ||
          processo.numero.includes('0001235') ||
          processo.numero.includes('0001236') ||
          (!observacoes.includes('API Pública DataJud') && 
           !observacoes.includes('TJSP - Consulta Pública') &&
           !observacoes.includes('Processo obtido via') &&
           !observacoes.includes('DataJud'));

        return !isFicticio; // Mantém apenas os não fictícios
      });

      console.log(`📊 Processos encontrados: ${processos.length}`);
      console.log(`📊 Processos reais mantidos: ${processosReais.length}`);
      console.log(`🗑️ Processos fictícios removidos: ${processos.length - processosReais.length}`);

      localStorage.setItem(this.STORAGE_KEYS.PROCESSOS, JSON.stringify(processosReais));
      console.log('✅ Processos fictícios removidos com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao limpar processos fictícios:', error);
    }
  }

  /**
   * Zera completamente o sistema (remove todos os dados)
   */
  static zerarSistemaCompleto(): void {
    console.log('🗑️ Zerando sistema completamente...');
    
    try {
      // Remove todos os dados
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Removido: ${key}`);
      });

      // Remove outras chaves relacionadas
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('processo') || 
          key.includes('financeiro') || 
          key.includes('usuario') ||
          key.includes('config') ||
          key.includes('monitor')
        )) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Removido adicional: ${key}`);
      });

      console.log('✅ Sistema zerado completamente!');
    } catch (error) {
      console.error('❌ Erro ao zerar sistema:', error);
    }
  }

  /**
   * Obtém estatísticas do banco de dados
   */
  static obterEstatisticas(): {
    totalItens: number;
    processos: number;
    financeiro: number;
    usuarios: number;
    configuracoes: number;
    monitoramento: number;
    tamanhoTotal: number;
  } {
    let totalItens = 0;
    let tamanhoTotal = 0;

    const estatisticas = {
      processos: 0,
      financeiro: 0,
      usuarios: 0,
      configuracoes: 0,
      monitoramento: 0
    };

    Object.entries(this.STORAGE_KEYS).forEach(([tipo, key]) => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const count = Array.isArray(parsed) ? parsed.length : 1;
          estatisticas[tipo.toLowerCase() as keyof typeof estatisticas] = count;
          totalItens += count;
          tamanhoTotal += data.length;
        } catch (error) {
          console.warn(`Erro ao processar ${key}:`, error);
        }
      }
    });

    return {
      totalItens,
      ...estatisticas,
      tamanhoTotal
    };
  }

  /**
   * Exporta todos os dados do banco
   */
  static exportarDados(): string {
    const dados: Record<string, any> = {};
    
    Object.entries(this.STORAGE_KEYS).forEach(([tipo, key]) => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          dados[tipo.toLowerCase()] = JSON.parse(data);
        } catch (error) {
          dados[tipo.toLowerCase()] = data;
        }
      }
    });

    return JSON.stringify(dados, null, 2);
  }

  /**
   * Importa dados para o banco
   */
  static importarDados(dadosJson: string): boolean {
    try {
      const dados = JSON.parse(dadosJson);
      
      Object.entries(dados).forEach(([tipo, data]) => {
        const key = this.STORAGE_KEYS[tipo.toUpperCase() as keyof typeof this.STORAGE_KEYS];
        if (key) {
          localStorage.setItem(key, JSON.stringify(data));
        }
      });

      console.log('✅ Dados importados com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error);
      return false;
    }
  }
}







 */
export class DatabaseService {
  private static readonly STORAGE_KEYS = {
    PROCESSOS: 'processos-judiciais',
    FINANCEIRO: 'financeiro-processos',
    USUARIOS: 'usuarios-sistema',
    CONFIGURACOES: 'configuracoes-sistema',
    MONITORAMENTO: 'processos-monitoramento'
  };

  /**
   * Limpa todos os dados do banco de dados
   */
  static limparBancoCompleto(): void {
    console.log('🗑️ Limpando banco de dados completo...');
    
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ Removido: ${key}`);
    });

    // Limpa também outras chaves que possam existir
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('processo') || 
        key.includes('financeiro') || 
        key.includes('usuario') ||
        key.includes('config') ||
        key.includes('monitor')
      )) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ Removido adicional: ${key}`);
    });

    console.log('🎉 Banco de dados limpo com sucesso!');
  }

  /**
   * Limpa apenas dados específicos
   */
  static limparDadosEspecificos(tipo: 'processos' | 'financeiro' | 'usuarios' | 'configuracoes' | 'monitoramento'): void {
    console.log(`🗑️ Limpando dados de: ${tipo}`);
    
    const key = this.STORAGE_KEYS[tipo.toUpperCase() as keyof typeof this.STORAGE_KEYS];
    if (key) {
      localStorage.removeItem(key);
      console.log(`✅ Removido: ${key}`);
    }
  }

  /**
   * Limpa apenas processos fictícios (mantém os reais)
   */
  static limparProcessosFicticios(): void {
    console.log('🗑️ Limpando apenas processos fictícios...');
    
    const processosData = localStorage.getItem(this.STORAGE_KEYS.PROCESSOS);
    if (!processosData) {
      console.log('ℹ️ Nenhum processo encontrado');
      return;
    }

    try {
      const processos = JSON.parse(processosData);
      const processosReais = processos.filter((processo: any) => {
        // Processos fictícios têm características específicas
        const observacoes = processo.observacoes || '';
        const cliente = processo.cliente?.nome || '';
        const assunto = processo.assunto || '';
        
        // Identifica processos fictícios por padrões conhecidos
        const isFicticio = 
          cliente.includes('Empresa ABC') ||
          cliente.includes('João Silva') ||
          cliente.includes('Maria Santos') ||
          cliente.includes('José da Silva') ||
          cliente.includes('Carlos Oliveira') ||
          assunto.includes('Cobrança de Dívida') ||
          assunto.includes('Exemplo') ||
          assunto.includes('Ação de Cobrança') ||
          assunto.includes('Reclamação Trabalhista') ||
          assunto.includes('Ação Penal') ||
          processo.numero.includes('123456') ||
          processo.numero.includes('0001234') ||
          processo.numero.includes('0001235') ||
          processo.numero.includes('0001236') ||
          (!observacoes.includes('API Pública DataJud') && 
           !observacoes.includes('TJSP - Consulta Pública') &&
           !observacoes.includes('Processo obtido via') &&
           !observacoes.includes('DataJud'));

        return !isFicticio; // Mantém apenas os não fictícios
      });

      console.log(`📊 Processos encontrados: ${processos.length}`);
      console.log(`📊 Processos reais mantidos: ${processosReais.length}`);
      console.log(`🗑️ Processos fictícios removidos: ${processos.length - processosReais.length}`);

      localStorage.setItem(this.STORAGE_KEYS.PROCESSOS, JSON.stringify(processosReais));
      console.log('✅ Processos fictícios removidos com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao limpar processos fictícios:', error);
    }
  }

  /**
   * Zera completamente o sistema (remove todos os dados)
   */
  static zerarSistemaCompleto(): void {
    console.log('🗑️ Zerando sistema completamente...');
    
    try {
      // Remove todos os dados
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Removido: ${key}`);
      });

      // Remove outras chaves relacionadas
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('processo') || 
          key.includes('financeiro') || 
          key.includes('usuario') ||
          key.includes('config') ||
          key.includes('monitor')
        )) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Removido adicional: ${key}`);
      });

      console.log('✅ Sistema zerado completamente!');
    } catch (error) {
      console.error('❌ Erro ao zerar sistema:', error);
    }
  }

  /**
   * Obtém estatísticas do banco de dados
   */
  static obterEstatisticas(): {
    totalItens: number;
    processos: number;
    financeiro: number;
    usuarios: number;
    configuracoes: number;
    monitoramento: number;
    tamanhoTotal: number;
  } {
    let totalItens = 0;
    let tamanhoTotal = 0;

    const estatisticas = {
      processos: 0,
      financeiro: 0,
      usuarios: 0,
      configuracoes: 0,
      monitoramento: 0
    };

    Object.entries(this.STORAGE_KEYS).forEach(([tipo, key]) => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const count = Array.isArray(parsed) ? parsed.length : 1;
          estatisticas[tipo.toLowerCase() as keyof typeof estatisticas] = count;
          totalItens += count;
          tamanhoTotal += data.length;
        } catch (error) {
          console.warn(`Erro ao processar ${key}:`, error);
        }
      }
    });

    return {
      totalItens,
      ...estatisticas,
      tamanhoTotal
    };
  }

  /**
   * Exporta todos os dados do banco
   */
  static exportarDados(): string {
    const dados: Record<string, any> = {};
    
    Object.entries(this.STORAGE_KEYS).forEach(([tipo, key]) => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          dados[tipo.toLowerCase()] = JSON.parse(data);
        } catch (error) {
          dados[tipo.toLowerCase()] = data;
        }
      }
    });

    return JSON.stringify(dados, null, 2);
  }

  /**
   * Importa dados para o banco
   */
  static importarDados(dadosJson: string): boolean {
    try {
      const dados = JSON.parse(dadosJson);
      
      Object.entries(dados).forEach(([tipo, data]) => {
        const key = this.STORAGE_KEYS[tipo.toUpperCase() as keyof typeof this.STORAGE_KEYS];
        if (key) {
          localStorage.setItem(key, JSON.stringify(data));
        }
      });

      console.log('✅ Dados importados com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error);
      return false;
    }
  }
}




