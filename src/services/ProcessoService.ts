import { Processo, Movimentacao } from '../types';

// Simulação de dados em memória (em produção seria um banco de dados)
let processosData: Processo[] = [];

let nextId = 1;

// Simulação de delay de API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ProcessoService {
  // Buscar todos os processos
  static async buscarProcessos(): Promise<Processo[]> {
    await delay(500);
    return [...processosData];
  }

  // Buscar processo por ID
  static async buscarProcessoPorId(id: string): Promise<Processo | null> {
    await delay(300);
    return processosData.find(p => p.id === id) || null;
  }

  // Criar novo processo
  static async criarProcesso(processo: Omit<Processo, 'id'>): Promise<Processo> {
    await delay(800);
    
    // Gerar ID único baseado em timestamp + random
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const idUnico = `PROC_${timestamp}_${random}`;
    
    const novoProcesso: Processo = {
      ...processo,
      id: idUnico,
      dataDistribuicao: new Date(),
      dataUltimaMovimentacao: new Date(),
      movimentacoes: [
        {
          id: `MOV_${timestamp}_1`,
          data: new Date(),
          tipo: 'Distribuição',
          descricao: 'Processo criado no sistema',
          usuario: 'Sistema',
        },
      ],
      documentos: [],
    };

    processosData.push(novoProcesso);
    nextId++;
    
    console.log(`✅ Processo criado com ID: ${idUnico}`);
    return novoProcesso;
  }

  // Atualizar processo
  static async atualizarProcesso(id: string, dadosAtualizacao: Partial<Processo>): Promise<Processo | null> {
    await delay(600);
    
    const index = processosData.findIndex(p => p.id === id);
    if (index === -1) return null;

    const processoAtualizado = {
      ...processosData[index],
      ...dadosAtualizacao,
      dataUltimaMovimentacao: new Date(),
    };

    processosData[index] = processoAtualizado;
    return processoAtualizado;
  }

  // Excluir processo
  static async excluirProcesso(id: string): Promise<boolean> {
    await delay(400);
    
    const index = processosData.findIndex(p => p.id === id);
    if (index === -1) return false;

    processosData.splice(index, 1);
    return true;
  }

  // Adicionar movimentação
  static async adicionarMovimentacao(
    processoId: string, 
    movimentacao: Omit<Movimentacao, 'id'>
  ): Promise<Movimentacao | null> {
    await delay(500);
    
    const processo = processosData.find(p => p.id === processoId);
    if (!processo) return null;

    const novaMovimentacao: Movimentacao = {
      ...movimentacao,
      id: (processo.movimentacoes.length + 1).toString(),
    };

    processo.movimentacoes.push(novaMovimentacao);
    processo.dataUltimaMovimentacao = new Date();

    return novaMovimentacao;
  }

  // Buscar processos por filtros
  static async buscarProcessosComFiltros(filtros: {
    busca?: string;
    tipo?: string;
    status?: string;
  }): Promise<Processo[]> {
    await delay(400);
    
    let processosFiltrados = [...processosData];

    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      processosFiltrados = processosFiltrados.filter(processo =>
        processo.numero.toLowerCase().includes(busca) ||
        processo.assunto.toLowerCase().includes(busca) ||
        processo.cliente.nome.toLowerCase().includes(busca) ||
        processo.cliente.cpfCnpj.toLowerCase().includes(busca)
      );
    }

    if (filtros.tipo) {
      processosFiltrados = processosFiltrados.filter(processo => processo.tipo === filtros.tipo);
    }

    if (filtros.status) {
      processosFiltrados = processosFiltrados.filter(processo => processo.status === filtros.status);
    }

    return processosFiltrados;
  }

  // Gerar número de processo único
  static async gerarNumeroProcesso(tipo: string, tribunal: string): Promise<string> {
    await delay(200);
    
    const ano = new Date().getFullYear();
    const sequencial = Math.floor(Math.random() * 9999999) + 1;
    const digito = Math.floor(Math.random() * 99) + 1;
    
    // Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
    return `${sequencial.toString().padStart(7, '0')}-${digito.toString().padStart(2, '0')}.${ano}.1.${tribunal}.${Math.floor(Math.random() * 9999) + 1}`;
  }

  // Validar CPF/CNPJ
  static validarCpfCnpj(cpfCnpj: string): boolean {
    const cleaned = cpfCnpj.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      // Validação de CPF
      return this.validarCPF(cleaned);
    } else if (cleaned.length === 14) {
      // Validação de CNPJ
      return this.validarCNPJ(cleaned);
    }
    
    return false;
  }

  private static validarCPF(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  private static validarCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    
    let soma = 0;
    let peso = 2;
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    if (digito1 !== parseInt(cnpj.charAt(12))) return false;
    
    soma = 0;
    peso = 2;
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    if (digito2 !== parseInt(cnpj.charAt(13))) return false;
    
    return true;
  }
}






