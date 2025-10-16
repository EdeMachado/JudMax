import { Processo, Movimentacao } from '../types';

// Simulação de dados de processos externos (APIs do TJ)
const processosExternos: Record<string, Processo> = {
  '0001234-56.2024.1.01.0001': {
    id: 'ext-1',
    numero: '0001234-56.2024.1.01.0001',
    tipo: 'civel',
    status: 'ativo',
    assunto: 'Ação de Cobrança',
    valorCausa: 50000,
    dataDistribuicao: new Date('2024-01-01'),
    dataUltimaMovimentacao: new Date('2024-01-15'),
    cliente: {
      nome: 'Empresa ABC Ltda',
      cpfCnpj: '12.345.678/0001-90',
      email: 'contato@empresaabc.com',
      telefone: '(11) 99999-9999',
    },
    advogadoResponsavel: 'João Silva',
    tribunal: 'TJSP',
    vara: '1ª Vara Cível',
    movimentacoes: [
      {
        id: 'mov-1',
        data: new Date('2024-01-01'),
        tipo: 'Distribuição',
        descricao: 'Processo distribuído',
        usuario: 'Sistema',
      },
      {
        id: 'mov-2',
        data: new Date('2024-01-05'),
        tipo: 'Petição',
        descricao: 'Petição inicial protocolada',
        usuario: 'João Silva',
      },
      {
        id: 'mov-3',
        data: new Date('2024-01-10'),
        tipo: 'Despacho',
        descricao: 'Processo recebido e autuado',
        usuario: 'Cartório',
      },
      {
        id: 'mov-4',
        data: new Date('2024-01-15'),
        tipo: 'Citação',
        descricao: 'Réu citado para responder',
        usuario: 'Oficial de Justiça',
      },
    ],
    documentos: [],
    observacoes: 'Processo de cobrança de valores em atraso.',
  },
  '0001235-67.2024.1.01.0002': {
    id: 'ext-2',
    numero: '0001235-67.2024.1.01.0002',
    tipo: 'trabalhista',
    status: 'ativo',
    assunto: 'Reclamação Trabalhista',
    valorCausa: 15000,
    dataDistribuicao: new Date('2024-01-02'),
    dataUltimaMovimentacao: new Date('2024-01-14'),
    cliente: {
      nome: 'Maria Santos',
      cpfCnpj: '123.456.789-00',
      email: 'maria.santos@email.com',
      telefone: '(11) 88888-8888',
    },
    advogadoResponsavel: 'Ana Costa',
    tribunal: 'TRT-2',
    vara: '2ª Vara do Trabalho',
    movimentacoes: [
      {
        id: 'mov-5',
        data: new Date('2024-01-02'),
        tipo: 'Distribuição',
        descricao: 'Processo distribuído',
        usuario: 'Sistema',
      },
      {
        id: 'mov-6',
        data: new Date('2024-01-08'),
        tipo: 'Petição',
        descricao: 'Reclamação trabalhista protocolada',
        usuario: 'Ana Costa',
      },
      {
        id: 'mov-7',
        data: new Date('2024-01-12'),
        tipo: 'Despacho',
        descricao: 'Processo recebido e autuado',
        usuario: 'Cartório',
      },
      {
        id: 'mov-8',
        data: new Date('2024-01-14'),
        tipo: 'Citação',
        descricao: 'Réu citado para responder',
        usuario: 'Oficial de Justiça',
      },
    ],
    documentos: [],
    observacoes: 'Reclamação por horas extras não pagas.',
  },
  '0001236-78.2024.1.01.0003': {
    id: 'ext-3',
    numero: '0001236-78.2024.1.01.0003',
    tipo: 'criminal',
    status: 'ativo',
    assunto: 'Ação Penal',
    valorCausa: 0,
    dataDistribuicao: new Date('2024-01-03'),
    dataUltimaMovimentacao: new Date('2024-01-13'),
    cliente: {
      nome: 'Carlos Oliveira',
      cpfCnpj: '987.654.321-00',
      email: 'carlos.oliveira@email.com',
      telefone: '(11) 77777-7777',
    },
    advogadoResponsavel: 'Pedro Mendes',
    tribunal: 'TJSP',
    vara: '3ª Vara Criminal',
    movimentacoes: [
      {
        id: 'mov-9',
        data: new Date('2024-01-03'),
        tipo: 'Distribuição',
        descricao: 'Processo distribuído',
        usuario: 'Sistema',
      },
      {
        id: 'mov-10',
        data: new Date('2024-01-09'),
        tipo: 'Petição',
        descricao: 'Denúncia recebida',
        usuario: 'Ministério Público',
      },
      {
        id: 'mov-11',
        data: new Date('2024-01-11'),
        tipo: 'Despacho',
        descricao: 'Processo recebido e autuado',
        usuario: 'Cartório',
      },
      {
        id: 'mov-12',
        data: new Date('2024-01-13'),
        tipo: 'Citação',
        descricao: 'Réu citado para responder',
        usuario: 'Oficial de Justiça',
      },
    ],
    documentos: [],
    observacoes: 'Ação penal por estelionato.',
  },
  // Processos com formatos diferentes para teste
  '1234567-89.2024.1.01.0004': {
    id: 'ext-4',
    numero: '1234567-89.2024.1.01.0004',
    tipo: 'civel',
    status: 'ativo',
    assunto: 'Ação de Indenização',
    valorCausa: 25000,
    dataDistribuicao: new Date('2024-01-04'),
    dataUltimaMovimentacao: new Date('2024-01-16'),
    cliente: {
      nome: 'Roberto Alves',
      cpfCnpj: '111.222.333-44',
      email: 'roberto.alves@email.com',
      telefone: '(11) 66666-6666',
    },
    advogadoResponsavel: 'Maria Santos',
    tribunal: 'TJSP',
    vara: '2ª Vara Cível',
    movimentacoes: [
      {
        id: 'mov-13',
        data: new Date('2024-01-04'),
        tipo: 'Distribuição',
        descricao: 'Processo distribuído',
        usuario: 'Sistema',
      },
      {
        id: 'mov-14',
        data: new Date('2024-01-08'),
        tipo: 'Petição',
        descricao: 'Petição inicial protocolada',
        usuario: 'Maria Santos',
      },
    ],
    documentos: [],
    observacoes: 'Ação de indenização por danos morais.',
  },
  '9876543-21.2024.1.01.0005': {
    id: 'ext-5',
    numero: '9876543-21.2024.1.01.0005',
    tipo: 'trabalhista',
    status: 'ativo',
    assunto: 'Rescisão Indireta',
    valorCausa: 30000,
    dataDistribuicao: new Date('2024-01-05'),
    dataUltimaMovimentacao: new Date('2024-01-17'),
    cliente: {
      nome: 'Ana Paula Costa',
      cpfCnpj: '555.666.777-88',
      email: 'ana.costa@email.com',
      telefone: '(11) 55555-5555',
    },
    advogadoResponsavel: 'Carlos Mendes',
    tribunal: 'TRT-2',
    vara: '1ª Vara do Trabalho',
    movimentacoes: [
      {
        id: 'mov-15',
        data: new Date('2024-01-05'),
        tipo: 'Distribuição',
        descricao: 'Processo distribuído',
        usuario: 'Sistema',
      },
      {
        id: 'mov-16',
        data: new Date('2024-01-09'),
        tipo: 'Petição',
        descricao: 'Reclamação trabalhista protocolada',
        usuario: 'Carlos Mendes',
      },
    ],
    documentos: [],
    observacoes: 'Reclamação por rescisão indireta.',
  },
};

export class ProcessoExternoService {
  /**
   * Busca dados de um processo externo pelo número
   */
  static async buscarProcessoExterno(numeroProcesso: string): Promise<Processo | null> {
    console.log('🔍 ProcessoExternoService.buscarProcessoExterno chamado com:', numeroProcesso);
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove espaços e converte para maiúsculo para busca
    const numeroLimpo = numeroProcesso.trim().toUpperCase();
    console.log('🧹 Número limpo:', numeroLimpo);
    
    // Busca o processo nos dados simulados (busca exata primeiro)
    let processo = processosExternos[numeroLimpo];
    console.log('🔎 Busca exata resultou em:', processo ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    
    // Se não encontrou, tenta buscar por similaridade (remove pontos e hífens)
    if (!processo) {
      const numeroSemFormatacao = numeroLimpo.replace(/[.\-\s]/g, '');
      console.log('🔄 Tentando busca sem formatação:', numeroSemFormatacao);
      
      for (const [key, value] of Object.entries(processosExternos)) {
        const keySemFormatacao = key.replace(/[.\-\s]/g, '');
        console.log('🔍 Comparando:', numeroSemFormatacao, 'com', keySemFormatacao);
        
        if (keySemFormatacao === numeroSemFormatacao) {
          processo = value;
          console.log('✅ Processo encontrado por similaridade!');
          break;
        }
      }
    }
    
    if (processo) {
      console.log('📋 Retornando processo:', processo.numero);
      // Retorna uma cópia do processo para evitar mutação
      return {
        ...processo,
        movimentacoes: [...processo.movimentacoes],
        documentos: [...processo.documentos],
      };
    }

    console.log('❌ Nenhum processo encontrado');
    return null;
  }

  /**
   * Valida se o número do processo está no formato correto
   */
  static validarNumeroProcesso(numero: string): boolean {
    // Formato mais flexível: aceita números com ou sem pontos/hífens
    const numeroLimpo = numero.trim().replace(/[.\-\s]/g, '');
    
    // Verifica se tem pelo menos 20 dígitos (formato básico)
    if (numeroLimpo.length < 20) return false;
    
    // Verifica se contém apenas números
    return /^\d+$/.test(numeroLimpo);
  }

  /**
   * Busca movimentações de um processo externo
   */
  static async buscarMovimentacoesExternas(numeroProcesso: string): Promise<Movimentacao[]> {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 800));

    const processo = processosExternos[numeroProcesso.trim().toUpperCase()];
    
    if (processo) {
      return [...processo.movimentacoes];
    }

    return [];
  }

  /**
   * Busca informações básicas do processo (sem movimentações)
   */
  static async buscarInformacoesBasicas(numeroProcesso: string): Promise<Partial<Processo> | null> {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    const processo = processosExternos[numeroProcesso.trim().toUpperCase()];
    
    if (processo) {
      return {
        numero: processo.numero,
        tipo: processo.tipo,
        status: processo.status,
        assunto: processo.assunto,
        valorCausa: processo.valorCausa,
        dataDistribuicao: processo.dataDistribuicao,
        dataUltimaMovimentacao: processo.dataUltimaMovimentacao,
        cliente: processo.cliente,
        advogadoResponsavel: processo.advogadoResponsavel,
        tribunal: processo.tribunal,
        vara: processo.vara,
        observacoes: processo.observacoes,
      };
    }

    return null;
  }

  /**
   * Lista todos os números de processos disponíveis para teste
   */
  static listarProcessosDisponiveis(): string[] {
    return Object.keys(processosExternos);
  }
}







// Simulação de dados de processos externos (APIs do TJ)
const processosExternos: Record<string, Processo> = {
  '0001234-56.2024.1.01.0001': {
    id: 'ext-1',
    numero: '0001234-56.2024.1.01.0001',
    tipo: 'civel',
    status: 'ativo',
    assunto: 'Ação de Cobrança',
    valorCausa: 50000,
    dataDistribuicao: new Date('2024-01-01'),
    dataUltimaMovimentacao: new Date('2024-01-15'),
    cliente: {
      nome: 'Empresa ABC Ltda',
      cpfCnpj: '12.345.678/0001-90',
      email: 'contato@empresaabc.com',
      telefone: '(11) 99999-9999',
    },
    advogadoResponsavel: 'João Silva',
    tribunal: 'TJSP',
    vara: '1ª Vara Cível',
    movimentacoes: [
      {
        id: 'mov-1',
        data: new Date('2024-01-01'),
        tipo: 'Distribuição',
        descricao: 'Processo distribuído',
        usuario: 'Sistema',
      },
      {
        id: 'mov-2',
        data: new Date('2024-01-05'),
        tipo: 'Petição',
        descricao: 'Petição inicial protocolada',
        usuario: 'João Silva',
      },
      {
        id: 'mov-3',
        data: new Date('2024-01-10'),
        tipo: 'Despacho',
        descricao: 'Processo recebido e autuado',
        usuario: 'Cartório',
      },
      {
        id: 'mov-4',
        data: new Date('2024-01-15'),
        tipo: 'Citação',
        descricao: 'Réu citado para responder',
        usuario: 'Oficial de Justiça',
      },
    ],
    documentos: [],
    observacoes: 'Processo de cobrança de valores em atraso.',
  },
  '0001235-67.2024.1.01.0002': {
    id: 'ext-2',
    numero: '0001235-67.2024.1.01.0002',
    tipo: 'trabalhista',
    status: 'ativo',
    assunto: 'Reclamação Trabalhista',
    valorCausa: 15000,
    dataDistribuicao: new Date('2024-01-02'),
    dataUltimaMovimentacao: new Date('2024-01-14'),
    cliente: {
      nome: 'Maria Santos',
      cpfCnpj: '123.456.789-00',
      email: 'maria.santos@email.com',
      telefone: '(11) 88888-8888',
    },
    advogadoResponsavel: 'Ana Costa',
    tribunal: 'TRT-2',
    vara: '2ª Vara do Trabalho',
    movimentacoes: [
      {
        id: 'mov-5',
        data: new Date('2024-01-02'),
        tipo: 'Distribuição',
        descricao: 'Processo distribuído',
        usuario: 'Sistema',
      },
      {
        id: 'mov-6',
        data: new Date('2024-01-08'),
        tipo: 'Petição',
        descricao: 'Reclamação trabalhista protocolada',
        usuario: 'Ana Costa',
      },
      {
        id: 'mov-7',
        data: new Date('2024-01-12'),
        tipo: 'Despacho',
        descricao: 'Processo recebido e autuado',
        usuario: 'Cartório',
      },
      {
        id: 'mov-8',
        data: new Date('2024-01-14'),
        tipo: 'Citação',
        descricao: 'Réu citado para responder',
        usuario: 'Oficial de Justiça',
      },
    ],
    documentos: [],
    observacoes: 'Reclamação por horas extras não pagas.',
  },
  '0001236-78.2024.1.01.0003': {
    id: 'ext-3',
    numero: '0001236-78.2024.1.01.0003',
    tipo: 'criminal',
    status: 'ativo',
    assunto: 'Ação Penal',
    valorCausa: 0,
    dataDistribuicao: new Date('2024-01-03'),
    dataUltimaMovimentacao: new Date('2024-01-13'),
    cliente: {
      nome: 'Carlos Oliveira',
      cpfCnpj: '987.654.321-00',
      email: 'carlos.oliveira@email.com',
      telefone: '(11) 77777-7777',
    },
    advogadoResponsavel: 'Pedro Mendes',
    tribunal: 'TJSP',
    vara: '3ª Vara Criminal',
    movimentacoes: [
      {
        id: 'mov-9',
        data: new Date('2024-01-03'),
        tipo: 'Distribuição',
        descricao: 'Processo distribuído',
        usuario: 'Sistema',
      },
      {
        id: 'mov-10',
        data: new Date('2024-01-09'),
        tipo: 'Petição',
        descricao: 'Denúncia recebida',
        usuario: 'Ministério Público',
      },
      {
        id: 'mov-11',
        data: new Date('2024-01-11'),
        tipo: 'Despacho',
        descricao: 'Processo recebido e autuado',
        usuario: 'Cartório',
      },
      {
        id: 'mov-12',
        data: new Date('2024-01-13'),
        tipo: 'Citação',
        descricao: 'Réu citado para responder',
        usuario: 'Oficial de Justiça',
      },
    ],
    documentos: [],
    observacoes: 'Ação penal por estelionato.',
  },
  // Processos com formatos diferentes para teste
  '1234567-89.2024.1.01.0004': {
    id: 'ext-4',
    numero: '1234567-89.2024.1.01.0004',
    tipo: 'civel',
    status: 'ativo',
    assunto: 'Ação de Indenização',
    valorCausa: 25000,
    dataDistribuicao: new Date('2024-01-04'),
    dataUltimaMovimentacao: new Date('2024-01-16'),
    cliente: {
      nome: 'Roberto Alves',
      cpfCnpj: '111.222.333-44',
      email: 'roberto.alves@email.com',
      telefone: '(11) 66666-6666',
    },
    advogadoResponsavel: 'Maria Santos',
    tribunal: 'TJSP',
    vara: '2ª Vara Cível',
    movimentacoes: [
      {
        id: 'mov-13',
        data: new Date('2024-01-04'),
        tipo: 'Distribuição',
        descricao: 'Processo distribuído',
        usuario: 'Sistema',
      },
      {
        id: 'mov-14',
        data: new Date('2024-01-08'),
        tipo: 'Petição',
        descricao: 'Petição inicial protocolada',
        usuario: 'Maria Santos',
      },
    ],
    documentos: [],
    observacoes: 'Ação de indenização por danos morais.',
  },
  '9876543-21.2024.1.01.0005': {
    id: 'ext-5',
    numero: '9876543-21.2024.1.01.0005',
    tipo: 'trabalhista',
    status: 'ativo',
    assunto: 'Rescisão Indireta',
    valorCausa: 30000,
    dataDistribuicao: new Date('2024-01-05'),
    dataUltimaMovimentacao: new Date('2024-01-17'),
    cliente: {
      nome: 'Ana Paula Costa',
      cpfCnpj: '555.666.777-88',
      email: 'ana.costa@email.com',
      telefone: '(11) 55555-5555',
    },
    advogadoResponsavel: 'Carlos Mendes',
    tribunal: 'TRT-2',
    vara: '1ª Vara do Trabalho',
    movimentacoes: [
      {
        id: 'mov-15',
        data: new Date('2024-01-05'),
        tipo: 'Distribuição',
        descricao: 'Processo distribuído',
        usuario: 'Sistema',
      },
      {
        id: 'mov-16',
        data: new Date('2024-01-09'),
        tipo: 'Petição',
        descricao: 'Reclamação trabalhista protocolada',
        usuario: 'Carlos Mendes',
      },
    ],
    documentos: [],
    observacoes: 'Reclamação por rescisão indireta.',
  },
};

export class ProcessoExternoService {
  /**
   * Busca dados de um processo externo pelo número
   */
  static async buscarProcessoExterno(numeroProcesso: string): Promise<Processo | null> {
    console.log('🔍 ProcessoExternoService.buscarProcessoExterno chamado com:', numeroProcesso);
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove espaços e converte para maiúsculo para busca
    const numeroLimpo = numeroProcesso.trim().toUpperCase();
    console.log('🧹 Número limpo:', numeroLimpo);
    
    // Busca o processo nos dados simulados (busca exata primeiro)
    let processo = processosExternos[numeroLimpo];
    console.log('🔎 Busca exata resultou em:', processo ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    
    // Se não encontrou, tenta buscar por similaridade (remove pontos e hífens)
    if (!processo) {
      const numeroSemFormatacao = numeroLimpo.replace(/[.\-\s]/g, '');
      console.log('🔄 Tentando busca sem formatação:', numeroSemFormatacao);
      
      for (const [key, value] of Object.entries(processosExternos)) {
        const keySemFormatacao = key.replace(/[.\-\s]/g, '');
        console.log('🔍 Comparando:', numeroSemFormatacao, 'com', keySemFormatacao);
        
        if (keySemFormatacao === numeroSemFormatacao) {
          processo = value;
          console.log('✅ Processo encontrado por similaridade!');
          break;
        }
      }
    }
    
    if (processo) {
      console.log('📋 Retornando processo:', processo.numero);
      // Retorna uma cópia do processo para evitar mutação
      return {
        ...processo,
        movimentacoes: [...processo.movimentacoes],
        documentos: [...processo.documentos],
      };
    }

    console.log('❌ Nenhum processo encontrado');
    return null;
  }

  /**
   * Valida se o número do processo está no formato correto
   */
  static validarNumeroProcesso(numero: string): boolean {
    // Formato mais flexível: aceita números com ou sem pontos/hífens
    const numeroLimpo = numero.trim().replace(/[.\-\s]/g, '');
    
    // Verifica se tem pelo menos 20 dígitos (formato básico)
    if (numeroLimpo.length < 20) return false;
    
    // Verifica se contém apenas números
    return /^\d+$/.test(numeroLimpo);
  }

  /**
   * Busca movimentações de um processo externo
   */
  static async buscarMovimentacoesExternas(numeroProcesso: string): Promise<Movimentacao[]> {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 800));

    const processo = processosExternos[numeroProcesso.trim().toUpperCase()];
    
    if (processo) {
      return [...processo.movimentacoes];
    }

    return [];
  }

  /**
   * Busca informações básicas do processo (sem movimentações)
   */
  static async buscarInformacoesBasicas(numeroProcesso: string): Promise<Partial<Processo> | null> {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    const processo = processosExternos[numeroProcesso.trim().toUpperCase()];
    
    if (processo) {
      return {
        numero: processo.numero,
        tipo: processo.tipo,
        status: processo.status,
        assunto: processo.assunto,
        valorCausa: processo.valorCausa,
        dataDistribuicao: processo.dataDistribuicao,
        dataUltimaMovimentacao: processo.dataUltimaMovimentacao,
        cliente: processo.cliente,
        advogadoResponsavel: processo.advogadoResponsavel,
        tribunal: processo.tribunal,
        vara: processo.vara,
        observacoes: processo.observacoes,
      };
    }

    return null;
  }

  /**
   * Lista todos os números de processos disponíveis para teste
   */
  static listarProcessosDisponiveis(): string[] {
    return Object.keys(processosExternos);
  }
}




