export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'advogado' | 'estagiario';
  ativo: boolean;
  dataCriacao: Date;
}

export interface Processo {
  id: string;
  numero: string;
  tipo: 'civel' | 'criminal' | 'trabalhista' | 'tributario' | 'administrativo';
  status: 'ativo' | 'arquivado' | 'suspenso' | 'concluido';
  assunto: string;
  classe?: string; // Classe processual
  valorCausa?: number;
  dataDistribuicao: Date;
  dataUltimaMovimentacao: Date;
  cliente: {
    nome: string;
    cpfCnpj: string;
    email?: string;
    telefone?: string;
  };
  advogadoResponsavel: string;
  tribunal: string;
  vara: string;
  situacao?: string; // Situação atual do processo
  partes?: ParteProcesso[]; // Partes envolvidas no processo
  movimentacoes: Movimentacao[];
  documentos: Documento[];
  observacoes?: string;
  financeiro?: FinanceiroProcesso;
}

export interface ParteProcesso {
  nome: string;
  tipo: 'autor' | 'reu';
  documento?: string;
  advogado?: string;
}

export interface Movimentacao {
  id: string;
  data: Date;
  tipo: string;
  descricao: string;
  usuario: string;
}

export interface Documento {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  dataUpload: Date;
  url: string;
}

export interface Relatorio {
  id: string;
  nome: string;
  tipo: 'processos_por_status' | 'processos_por_tipo' | 'movimentacoes_periodo' | 'performance_advogados';
  parametros: Record<string, any>;
  dataGeracao: Date;
  dados: any[];
}

export interface DashboardData {
  totalProcessos: number;
  processosAtivos: number;
  processosArquivados: number;
  processosConcluidos: number;
  processosPorTipo: Array<{ tipo: string; quantidade: number }>;
  processosPorStatus: Array<{ status: string; quantidade: number }>;
  movimentacoesRecentes: Movimentacao[];
  processosVencendo: Processo[];
}

// Tipos para o módulo financeiro
export interface FinanceiroProcesso {
  id: string;
  processoId: string;
  valorCausa: number;
  honorarios: Honorario[];
  despesas: Despesa[];
  pagamentos: Pagamento[];
  saldoDevedor: number;
  saldoReceber: number;
  statusFinanceiro: 'em_aberto' | 'parcialmente_pago' | 'quitado' | 'em_atraso';
  dataVencimento?: Date;
  observacoes?: string;
}

export interface Honorario {
  id: string;
  tipo: 'contratual' | 'successio_nominis' | 'arbitrado' | 'fixo' | 'percentual';
  descricao: string;
  valor: number;
  percentual?: number; // Para honorários percentuais
  dataContratacao: Date;
  dataVencimento?: Date;
  status: 'pendente' | 'pago' | 'parcial' | 'vencido';
  observacoes?: string;
}

export interface Despesa {
  id: string;
  tipo: 'custas' | 'pericia' | 'documentos' | 'correios' | 'outros';
  descricao: string;
  valor: number;
  data: Date;
  comprovante?: string;
  reembolsavel: boolean;
  status: 'pendente' | 'pago' | 'reembolsado';
}

export interface Pagamento {
  id: string;
  tipo: 'honorario' | 'despesa' | 'adiantamento';
  descricao: string;
  valor: number;
  dataPagamento: Date;
  formaPagamento: 'dinheiro' | 'transferencia' | 'cheque' | 'cartao' | 'pix';
  comprovante?: string;
  observacoes?: string;
}

export interface RelatorioFinanceiro {
  id: string;
  periodoInicio: Date;
  periodoFim: Date;
  totalHonorarios: number;
  totalDespesas: number;
  totalRecebido: number;
  saldoPendente: number;
  processos: Array<{
    processoId: string;
    numero: string;
    cliente: string;
    honorarios: number;
    despesas: number;
    recebido: number;
    saldo: number;
  }>;
}






