import { supabase } from '../lib/supabase';
import { classifyError } from '../lib/supabaseHealth';
import type { RealEstateAgency, Visit, ServiceResult } from '../types';

function mapVisit(visit: any): Visit {
  return {
    id: visit.id.toString(),
    code: visit.codigo || `V-${visit.id}`,
    date: visit.data,
    realEstateAgency: visit.agencia,
    address: visit.endereco || '',
    status: visit.status,
    type: visit.servico,
    value: parseFloat(visit.valor) || 0,
    observations: visit.observacoes || '',
    criado_em: visit.criado_em,
    atualizado_em: visit.atualizado_em
  };
}

export const sheetsService = {
  async getAgencies(): Promise<ServiceResult<RealEstateAgency[]>> {
    try {
      const { data, error, status } = await supabase
        .schema('insideview')
        .from('agencias')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        return { ok: false, error: error.message, connectionStatus: classifyError(status, error) };
      }

      return {
        ok: true,
        data: (data || []).map((agency: any) => ({
          id: agency.id.toString(),
          name: agency.nome
        }))
      };
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Erro desconhecido', connectionStatus: classifyError(null, error) };
    }
  },

  async getVisits(): Promise<ServiceResult<Visit[]>> {
    try {
      const { data, error, status } = await supabase
        .schema('insideview')
        .from('visitas')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) {
        return { ok: false, error: error.message, connectionStatus: classifyError(status, error) };
      }

      return { ok: true, data: (data || []).map(mapVisit) };
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Erro desconhecido', connectionStatus: classifyError(null, error) };
    }
  },

  async saveVisit(visit: Omit<Visit, 'id'>): Promise<ServiceResult<Visit>> {
    try {
      // Verificar se a agência existe
      const { data: existingAgency, error: agencyError, status: agencyStatus } = await supabase
        .schema('insideview')
        .from('agencias')
        .select('id')
        .eq('nome', visit.realEstateAgency)
        .single();

      // PGRST116 = "Row not found" — esperado, não é erro de conexão
      if (agencyError && agencyError.code !== 'PGRST116') {
        const connStatus = classifyError(agencyStatus, agencyError);
        if (connStatus === 'disconnected') {
          return { ok: false, error: 'Servidor indisponível', connectionStatus: 'disconnected' };
        }
      }

      // Se não existir, criar a agência
      if (!existingAgency) {
        const { error: insertError, status: insertStatus } = await supabase
          .schema('insideview')
          .from('agencias')
          .insert({ nome: visit.realEstateAgency, ativo: true });

        if (insertError) {
          const connStatus = classifyError(insertStatus, insertError);
          if (connStatus === 'disconnected') {
            return { ok: false, error: 'Servidor indisponível ao criar agência', connectionStatus: 'disconnected' };
          }
        }
      }

      // Salvar a visita
      const now = new Date();
      const { data, error, status } = await supabase
        .schema('insideview')
        .from('visitas')
        .insert({
          codigo: visit.code,
          agencia: visit.realEstateAgency,
          servico: visit.type,
          endereco: visit.address,
          valor: visit.value,
          data: visit.date,
          status: visit.status,
          observacoes: visit.observations || '',
          criado_em: now.toISOString(),
          atualizado_em: now.toISOString()
        })
        .select('*')
        .single();

      if (error) {
        return { ok: false, error: error.message, connectionStatus: classifyError(status, error) };
      }

      return { ok: true, data: mapVisit(data) };
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Erro desconhecido', connectionStatus: classifyError(null, error) };
    }
  },

  async updateVisit(visit: Visit): Promise<ServiceResult<Visit>> {
    try {
      const now = new Date();
      const { data, error, status } = await supabase
        .schema('insideview')
        .from('visitas')
        .update({
          codigo: visit.code,
          agencia: visit.realEstateAgency,
          servico: visit.type,
          endereco: visit.address,
          valor: visit.value,
          data: visit.date,
          status: visit.status,
          observacoes: visit.observations || '',
          atualizado_em: now.toISOString()
        })
        .eq('id', parseInt(visit.id))
        .select('*')
        .single();

      if (error) {
        return { ok: false, error: error.message, connectionStatus: classifyError(status, error) };
      }

      return { ok: true, data: mapVisit(data) };
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Erro desconhecido', connectionStatus: classifyError(null, error) };
    }
  },

  async getVisitsForExport(agencyName: string, month: number, year: number): Promise<ServiceResult<Visit[]>> {
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      let query = supabase
        .schema('insideview')
        .from('visitas')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate)
        .order('data', { ascending: false });

      if (agencyName !== 'all') {
        query = query.eq('agencia', agencyName);
      }

      const { data, error, status } = await query;

      if (error) {
        return { ok: false, error: error.message, connectionStatus: classifyError(status, error) };
      }

      return { ok: true, data: (data || []).map(mapVisit) };
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Erro desconhecido', connectionStatus: classifyError(null, error) };
    }
  },

  async deleteVisit(id: string): Promise<ServiceResult<void>> {
    try {
      const { error, status } = await supabase
        .schema('insideview')
        .from('visitas')
        .delete()
        .eq('id', parseInt(id));

      if (error) {
        return { ok: false, error: error.message, connectionStatus: classifyError(status, error) };
      }

      return { ok: true, data: undefined };
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Erro desconhecido', connectionStatus: classifyError(null, error) };
    }
  }
};
