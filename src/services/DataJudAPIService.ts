import { Processo } from '../types';

export class DataJudAPIService {
  private static readonly BASE_URL = 'https://api-publica.datajud.cnj.jus.br';
  private static readonly API_KEY = 'APIKey [Chave Pública]'; // Substitua pela chave real

  /**
   * Busca um processo na API Pública do DataJud
   */
  static async buscarProcesso(numeroProcesso: string): Promise<Processo | null> {
    try {
      console.log('🔍 Buscando processo na API DataJud:', numeroProcesso);
      
      // Identifica o tribunal baseado no número do processo
      const tribunal = this.identificarTribunalPorCodigo(numeroProcesso);
      if (!tribunal) {
        throw new Error('Tribunal não identificado para o número do processo');
      }

      // Constrói a URL do endpoint específico do tribunal
      const endpoint = this.construirEndpointTribunal(tribunal);
      
      // Constrói a query Elasticsearch
      const query = this.construirQueryElasticsearch(numeroProcesso);
      
      console.log('📡 Endpoint:', endpoint);
      console.log('🔍 Query:', JSON.stringify(query, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': this.API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📄 Resposta da API DataJud:', data);

      // Processa a resposta e converte para o formato interno
      return this.processarRespostaAPI(data, numeroProcesso);

    } catch (error) {
      console.error('❌ Erro na API DataJud:', error);
      throw error;
    }
  }

  /**
   * Identifica o tribunal baseado no código do processo
   */
  private static identificarTribunalPorCodigo(numeroProcesso: string): string | null {
    const numeroLimpo = numeroProcesso.replace(/\D/g, '');
    
    if (numeroLimpo.length >= 20) {
      const codigoTribunal = numeroLimpo.substring(12, 14);
      console.log(`🔍 Código do tribunal extraído: ${codigoTribunal}`);
      
      // Mapeamento simplificado de códigos para tribunais
      const codigoTribunais: { [key: string]: string } = {
        '01': 'TJAC',
        '02': 'TJAL',
        '03': 'TJAM',
        '04': 'TJAP',
        '05': 'TJBA',
        '06': 'TJCE',
        '07': 'TJDFT',
        '08': 'TJES',
        '09': 'TJGO',
        '10': 'TJMA',
        '11': 'TJMT',
        '12': 'TJMS',
        '13': 'TJMG',
        '14': 'TJPA',
        '15': 'TJPB',
        '16': 'TJPR',
        '17': 'TJPE',
        '18': 'TJPI',
        '19': 'TJRJ',
        '20': 'TJRN',
        '21': 'TJRS',
        '22': 'TJRO',
        '23': 'TJRR',
        '24': 'TJSC',
        '25': 'TJSE',
        '26': 'TJSP',
        '27': 'TJTO',
        '00': 'STF',
        '90': 'STJ',
      };
      
      return codigoTribunais[codigoTribunal] || null;
    }
    
    return null;
  }

  /**
   * Constrói o endpoint específico do tribunal
   */
  private static construirEndpointTribunal(tribunal: string): string {
    const aliases: { [key: string]: string } = {
      'TJSP': 'api_publica_tjsp',
      'TJMG': 'api_publica_tjmg',
      'TJRJ': 'api_publica_tjrj',
      'TJRS': 'api_publica_tjrs',
      'TJPR': 'api_publica_tjpr',
      'TJSC': 'api_publica_tjsc',
      'TJBA': 'api_publica_tjba',
      'TJCE': 'api_publica_tjce',
      'TJPE': 'api_publica_tjpe',
      'TJGO': 'api_publica_tjgo',
      'TJMT': 'api_publica_tjmt',
      'TJMS': 'api_publica_tjms',
      'TJPA': 'api_publica_tjpa',
      'TJMA': 'api_publica_tjma',
      'TJPI': 'api_publica_tjpi',
      'TJPB': 'api_publica_tjpb',
      'TJRN': 'api_publica_tjrn',
      'TJRO': 'api_publica_tjro',
      'TJRR': 'api_publica_tjrr',
      'TJSE': 'api_publica_tjse',
      'TJTO': 'api_publica_tjto',
      'TJAC': 'api_publica_tjac',
      'TJAL': 'api_publica_tjal',
      'TJAM': 'api_publica_tjam',
      'TJAP': 'api_publica_tjap',
      'TJDFT': 'api_publica_tjdft',
      'TJES': 'api_publica_tjes',
      'STJ': 'api_publica_stj',
      'STF': 'api_publica_stf',
      'TST': 'api_publica_tst',
      'TSE': 'api_publica_tse',
      'STM': 'api_publica_stm',
    };

    const alias = aliases[tribunal];
    if (!alias) {
      throw new Error(`Tribunal não suportado: ${tribunal}`);
    }

    return `${this.BASE_URL}/${alias}/_search`;
  }

  /**
   * Constrói a query Elasticsearch para busca do processo
   */
  private static construirQueryElasticsearch(numeroProcesso: string): any {
    return {
      query: {
        match: {
          numeroProcesso: numeroProcesso
        }
      },
      size: 1,
      sort: [
        {
          '@timestamp': {
            order: 'desc'
          }
        }
      ]
    };
  }

  /**
   * Processa a resposta da API e converte para o formato interno
   */
  private static processarRespostaAPI(data: any, numeroProcesso: string): Processo | null {
    try {
      console.log('🔄 Processando resposta da API DataJud...');

      if (!data.hits || !data.hits.hits || data.hits.hits.length === 0) {
        console.log('❌ Nenhum processo encontrado na API DataJud');
        return null;
      }

      const processoData = data.hits.hits[0]._source;
      console.log('📋 Dados do processo encontrado:', processoData);

      // Converte os dados da API para o formato interno
      const processo: Processo = {
        id: Math.random().toString(36).substr(2, 9),
        numero: processoData.numeroProcesso || numeroProcesso,
        tipo: this.identificarTipoProcesso(processoData.classe?.codigo),
        status: this.converterStatus(processoData.situacao),
        assunto: processoData.assuntos?.[0]?.nome || 'Assunto não informado',
        classe: processoData.classe?.nome || 'Classe não informada',
        valorCausa: processoData.valorCausa,
        dataDistribuicao: new Date(processoData.dataAjuizamento || Date.now()),
        dataUltimaMovimentacao: new Date(processoData.movimentos?.[0]?.dataHora || Date.now()),
        cliente: {
          nome: this.extrairNomeCliente(processoData.polos),
          cpfCnpj: this.extrairDocumentoCliente(processoData.polos),
          email: '',
          telefone: '',
        },
        advogadoResponsavel: this.extrairAdvogadoResponsavel(processoData.polos),
        tribunal: this.identificarTribunalPorCodigo(numeroProcesso) || 'Tribunal não identificado',
        vara: processoData.orgaoJulgador?.nome || 'Vara não informada',
        situacao: processoData.situacao || 'Situação não informada',
        partes: this.extrairPartes(processoData.polos),
        movimentacoes: this.extrairMovimentacoes(processoData.movimentos),
        documentos: [],
        observacoes: `Processo obtido via API Pública DataJud - ${new Date().toISOString()}`,
      };

      console.log('✅ Processo convertido com sucesso:', processo);
      return processo;

    } catch (error) {
      console.error('❌ Erro ao processar resposta da API:', error);
      throw error;
    }
  }

  private static identificarTipoProcesso(codigoClasse?: number): 'civel' | 'criminal' | 'trabalhista' | 'tributario' | 'administrativo' {
    if (!codigoClasse) return 'civel';
    if (codigoClasse >= 1000 && codigoClasse < 2000) return 'civel';
    if (codigoClasse >= 2000 && codigoClasse < 3000) return 'criminal';
    if (codigoClasse >= 3000 && codigoClasse < 4000) return 'trabalhista';
    if (codigoClasse >= 4000 && codigoClasse < 5000) return 'tributario';
    if (codigoClasse >= 5000 && codigoClasse < 6000) return 'administrativo';
    return 'civel';
  }

  private static converterStatus(situacao?: string): 'ativo' | 'arquivado' | 'suspenso' | 'concluido' {
    if (!situacao) return 'ativo';
    const situacaoLower = situacao.toLowerCase();
    if (situacaoLower.includes('arquivado') || situacaoLower.includes('arquivamento')) return 'arquivado';
    if (situacaoLower.includes('suspenso') || situacaoLower.includes('suspensão')) return 'suspenso';
    if (situacaoLower.includes('concluido') || situacaoLower.includes('conclusão') || situacaoLower.includes('finalizado')) return 'concluido';
    return 'ativo';
  }

  private static extrairNomeCliente(polos?: any[]): string {
    if (!polos || polos.length === 0) return 'Cliente não informado';
    const poloAtivo = polos.find(polo => polo.polo === 'AT');
    if (poloAtivo && poloAtivo.partes && poloAtivo.partes.length > 0) {
      const parte = poloAtivo.partes[0];
      if (parte.pessoa) {
        return parte.pessoa.nome || 'Cliente não informado';
      }
    }
    return 'Cliente não informado';
  }

  private static extrairDocumentoCliente(polos?: any[]): string {
    if (!polos || polos.length === 0) return '';
    const poloAtivo = polos.find(polo => polo.polo === 'AT');
    if (poloAtivo && poloAtivo.partes && poloAtivo.partes.length > 0) {
      const parte = poloAtivo.partes[0];
      if (parte.pessoa && parte.pessoa.numeroDocumentoPrincipal) {
        return parte.pessoa.numeroDocumentoPrincipal;
      }
    }
    return '';
  }

  private static extrairAdvogadoResponsavel(polos?: any[]): string {
    if (!polos || polos.length === 0) return 'Advogado não informado';
    const poloAtivo = polos.find(polo => polo.polo === 'AT');
    if (poloAtivo && poloAtivo.partes && poloAtivo.partes.length > 0) {
      const parte = poloAtivo.partes[0];
      if (parte.advogados && parte.advogados.length > 0) {
        return parte.advogados[0].nome || 'Advogado não informado';
      }
    }
    return 'Advogado não informado';
  }

  private static extrairPartes(polos?: any[]): any[] {
    if (!polos || polos.length === 0) return [];
    const partes: any[] = [];
    polos.forEach(polo => {
      if (polo.partes) {
        polo.partes.forEach((parte: any) => {
          if (parte.pessoa) {
            partes.push({
              nome: parte.pessoa.nome || 'Nome não informado',
              tipo: polo.polo === 'AT' ? 'autor' : 'reu',
              documento: parte.pessoa.numeroDocumentoPrincipal || '',
              advogado: parte.advogados?.[0]?.nome || '',
            });
          }
        });
      }
    });
    return partes;
  }

  private static extrairMovimentacoes(movimentos?: any[]): any[] {
    if (!movimentos || movimentos.length === 0) return [];
    return movimentos.map((mov: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      data: new Date(mov.dataHora || Date.now()),
      tipo: mov.movimentoNacional?.codigoNacional ? `Movimento ${mov.movimentoNacional.codigoNacional}` : 'Movimento',
      descricao: mov.movimentoLocal?.descricao || mov.movimentoNacional?.codigoNacional?.toString() || 'Movimentação',
      usuario: mov.responsavelMovimento || 'Sistema',
    }));
  }
}







export class DataJudAPIService {
  private static readonly BASE_URL = 'https://api-publica.datajud.cnj.jus.br';
  private static readonly API_KEY = 'APIKey [Chave Pública]'; // Substitua pela chave real

  /**
   * Busca um processo na API Pública do DataJud
   */
  static async buscarProcesso(numeroProcesso: string): Promise<Processo | null> {
    try {
      console.log('🔍 Buscando processo na API DataJud:', numeroProcesso);
      
      // Identifica o tribunal baseado no número do processo
      const tribunal = this.identificarTribunalPorCodigo(numeroProcesso);
      if (!tribunal) {
        throw new Error('Tribunal não identificado para o número do processo');
      }

      // Constrói a URL do endpoint específico do tribunal
      const endpoint = this.construirEndpointTribunal(tribunal);
      
      // Constrói a query Elasticsearch
      const query = this.construirQueryElasticsearch(numeroProcesso);
      
      console.log('📡 Endpoint:', endpoint);
      console.log('🔍 Query:', JSON.stringify(query, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': this.API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📄 Resposta da API DataJud:', data);

      // Processa a resposta e converte para o formato interno
      return this.processarRespostaAPI(data, numeroProcesso);

    } catch (error) {
      console.error('❌ Erro na API DataJud:', error);
      throw error;
    }
  }

  /**
   * Identifica o tribunal baseado no código do processo
   */
  private static identificarTribunalPorCodigo(numeroProcesso: string): string | null {
    const numeroLimpo = numeroProcesso.replace(/\D/g, '');
    
    if (numeroLimpo.length >= 20) {
      const codigoTribunal = numeroLimpo.substring(12, 14);
      console.log(`🔍 Código do tribunal extraído: ${codigoTribunal}`);
      
      // Mapeamento simplificado de códigos para tribunais
      const codigoTribunais: { [key: string]: string } = {
        '01': 'TJAC',
        '02': 'TJAL',
        '03': 'TJAM',
        '04': 'TJAP',
        '05': 'TJBA',
        '06': 'TJCE',
        '07': 'TJDFT',
        '08': 'TJES',
        '09': 'TJGO',
        '10': 'TJMA',
        '11': 'TJMT',
        '12': 'TJMS',
        '13': 'TJMG',
        '14': 'TJPA',
        '15': 'TJPB',
        '16': 'TJPR',
        '17': 'TJPE',
        '18': 'TJPI',
        '19': 'TJRJ',
        '20': 'TJRN',
        '21': 'TJRS',
        '22': 'TJRO',
        '23': 'TJRR',
        '24': 'TJSC',
        '25': 'TJSE',
        '26': 'TJSP',
        '27': 'TJTO',
        '00': 'STF',
        '90': 'STJ',
      };
      
      return codigoTribunais[codigoTribunal] || null;
    }
    
    return null;
  }

  /**
   * Constrói o endpoint específico do tribunal
   */
  private static construirEndpointTribunal(tribunal: string): string {
    const aliases: { [key: string]: string } = {
      'TJSP': 'api_publica_tjsp',
      'TJMG': 'api_publica_tjmg',
      'TJRJ': 'api_publica_tjrj',
      'TJRS': 'api_publica_tjrs',
      'TJPR': 'api_publica_tjpr',
      'TJSC': 'api_publica_tjsc',
      'TJBA': 'api_publica_tjba',
      'TJCE': 'api_publica_tjce',
      'TJPE': 'api_publica_tjpe',
      'TJGO': 'api_publica_tjgo',
      'TJMT': 'api_publica_tjmt',
      'TJMS': 'api_publica_tjms',
      'TJPA': 'api_publica_tjpa',
      'TJMA': 'api_publica_tjma',
      'TJPI': 'api_publica_tjpi',
      'TJPB': 'api_publica_tjpb',
      'TJRN': 'api_publica_tjrn',
      'TJRO': 'api_publica_tjro',
      'TJRR': 'api_publica_tjrr',
      'TJSE': 'api_publica_tjse',
      'TJTO': 'api_publica_tjto',
      'TJAC': 'api_publica_tjac',
      'TJAL': 'api_publica_tjal',
      'TJAM': 'api_publica_tjam',
      'TJAP': 'api_publica_tjap',
      'TJDFT': 'api_publica_tjdft',
      'TJES': 'api_publica_tjes',
      'STJ': 'api_publica_stj',
      'STF': 'api_publica_stf',
      'TST': 'api_publica_tst',
      'TSE': 'api_publica_tse',
      'STM': 'api_publica_stm',
    };

    const alias = aliases[tribunal];
    if (!alias) {
      throw new Error(`Tribunal não suportado: ${tribunal}`);
    }

    return `${this.BASE_URL}/${alias}/_search`;
  }

  /**
   * Constrói a query Elasticsearch para busca do processo
   */
  private static construirQueryElasticsearch(numeroProcesso: string): any {
    return {
      query: {
        match: {
          numeroProcesso: numeroProcesso
        }
      },
      size: 1,
      sort: [
        {
          '@timestamp': {
            order: 'desc'
          }
        }
      ]
    };
  }

  /**
   * Processa a resposta da API e converte para o formato interno
   */
  private static processarRespostaAPI(data: any, numeroProcesso: string): Processo | null {
    try {
      console.log('🔄 Processando resposta da API DataJud...');

      if (!data.hits || !data.hits.hits || data.hits.hits.length === 0) {
        console.log('❌ Nenhum processo encontrado na API DataJud');
        return null;
      }

      const processoData = data.hits.hits[0]._source;
      console.log('📋 Dados do processo encontrado:', processoData);

      // Converte os dados da API para o formato interno
      const processo: Processo = {
        id: Math.random().toString(36).substr(2, 9),
        numero: processoData.numeroProcesso || numeroProcesso,
        tipo: this.identificarTipoProcesso(processoData.classe?.codigo),
        status: this.converterStatus(processoData.situacao),
        assunto: processoData.assuntos?.[0]?.nome || 'Assunto não informado',
        classe: processoData.classe?.nome || 'Classe não informada',
        valorCausa: processoData.valorCausa,
        dataDistribuicao: new Date(processoData.dataAjuizamento || Date.now()),
        dataUltimaMovimentacao: new Date(processoData.movimentos?.[0]?.dataHora || Date.now()),
        cliente: {
          nome: this.extrairNomeCliente(processoData.polos),
          cpfCnpj: this.extrairDocumentoCliente(processoData.polos),
          email: '',
          telefone: '',
        },
        advogadoResponsavel: this.extrairAdvogadoResponsavel(processoData.polos),
        tribunal: this.identificarTribunalPorCodigo(numeroProcesso) || 'Tribunal não identificado',
        vara: processoData.orgaoJulgador?.nome || 'Vara não informada',
        situacao: processoData.situacao || 'Situação não informada',
        partes: this.extrairPartes(processoData.polos),
        movimentacoes: this.extrairMovimentacoes(processoData.movimentos),
        documentos: [],
        observacoes: `Processo obtido via API Pública DataJud - ${new Date().toISOString()}`,
      };

      console.log('✅ Processo convertido com sucesso:', processo);
      return processo;

    } catch (error) {
      console.error('❌ Erro ao processar resposta da API:', error);
      throw error;
    }
  }

  private static identificarTipoProcesso(codigoClasse?: number): 'civel' | 'criminal' | 'trabalhista' | 'tributario' | 'administrativo' {
    if (!codigoClasse) return 'civel';
    if (codigoClasse >= 1000 && codigoClasse < 2000) return 'civel';
    if (codigoClasse >= 2000 && codigoClasse < 3000) return 'criminal';
    if (codigoClasse >= 3000 && codigoClasse < 4000) return 'trabalhista';
    if (codigoClasse >= 4000 && codigoClasse < 5000) return 'tributario';
    if (codigoClasse >= 5000 && codigoClasse < 6000) return 'administrativo';
    return 'civel';
  }

  private static converterStatus(situacao?: string): 'ativo' | 'arquivado' | 'suspenso' | 'concluido' {
    if (!situacao) return 'ativo';
    const situacaoLower = situacao.toLowerCase();
    if (situacaoLower.includes('arquivado') || situacaoLower.includes('arquivamento')) return 'arquivado';
    if (situacaoLower.includes('suspenso') || situacaoLower.includes('suspensão')) return 'suspenso';
    if (situacaoLower.includes('concluido') || situacaoLower.includes('conclusão') || situacaoLower.includes('finalizado')) return 'concluido';
    return 'ativo';
  }

  private static extrairNomeCliente(polos?: any[]): string {
    if (!polos || polos.length === 0) return 'Cliente não informado';
    const poloAtivo = polos.find(polo => polo.polo === 'AT');
    if (poloAtivo && poloAtivo.partes && poloAtivo.partes.length > 0) {
      const parte = poloAtivo.partes[0];
      if (parte.pessoa) {
        return parte.pessoa.nome || 'Cliente não informado';
      }
    }
    return 'Cliente não informado';
  }

  private static extrairDocumentoCliente(polos?: any[]): string {
    if (!polos || polos.length === 0) return '';
    const poloAtivo = polos.find(polo => polo.polo === 'AT');
    if (poloAtivo && poloAtivo.partes && poloAtivo.partes.length > 0) {
      const parte = poloAtivo.partes[0];
      if (parte.pessoa && parte.pessoa.numeroDocumentoPrincipal) {
        return parte.pessoa.numeroDocumentoPrincipal;
      }
    }
    return '';
  }

  private static extrairAdvogadoResponsavel(polos?: any[]): string {
    if (!polos || polos.length === 0) return 'Advogado não informado';
    const poloAtivo = polos.find(polo => polo.polo === 'AT');
    if (poloAtivo && poloAtivo.partes && poloAtivo.partes.length > 0) {
      const parte = poloAtivo.partes[0];
      if (parte.advogados && parte.advogados.length > 0) {
        return parte.advogados[0].nome || 'Advogado não informado';
      }
    }
    return 'Advogado não informado';
  }

  private static extrairPartes(polos?: any[]): any[] {
    if (!polos || polos.length === 0) return [];
    const partes: any[] = [];
    polos.forEach(polo => {
      if (polo.partes) {
        polo.partes.forEach((parte: any) => {
          if (parte.pessoa) {
            partes.push({
              nome: parte.pessoa.nome || 'Nome não informado',
              tipo: polo.polo === 'AT' ? 'autor' : 'reu',
              documento: parte.pessoa.numeroDocumentoPrincipal || '',
              advogado: parte.advogados?.[0]?.nome || '',
            });
          }
        });
      }
    });
    return partes;
  }

  private static extrairMovimentacoes(movimentos?: any[]): any[] {
    if (!movimentos || movimentos.length === 0) return [];
    return movimentos.map((mov: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      data: new Date(mov.dataHora || Date.now()),
      tipo: mov.movimentoNacional?.codigoNacional ? `Movimento ${mov.movimentoNacional.codigoNacional}` : 'Movimento',
      descricao: mov.movimentoLocal?.descricao || mov.movimentoNacional?.codigoNacional?.toString() || 'Movimentação',
      usuario: mov.responsavelMovimento || 'Sistema',
    }));
  }
}




