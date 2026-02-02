import { supabase } from '../lib/supabase';
import { RealEstateAgency, Visit } from '../types';

export const sheetsService = {
  async getAgencies(): Promise<RealEstateAgency[]> {
    try {
      const { data, error } = await supabase
        .schema('insideview')
        .from('agencias')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar agências:', error);
        throw error;
      }

      return (data || []).map((agency: any) => ({
        id: agency.id.toString(),
        name: agency.nome
      }));
    } catch (error) {
      console.error('Erro ao buscar agências:', error);
      return [];
    }
  },

  async getVisits(): Promise<Visit[]> {
    try {
      const { data, error } = await supabase
        .schema('insideview')
        .from('visitas')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      return (data || []).map((visit: any) => ({
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
      }));
    } catch (error) {
      console.error('Erro ao buscar visitas:', error);
      return [];
    }
  },

  async saveVisit(visit: Omit<Visit, 'id'>): Promise<Visit> {
    try {
      console.log('Salvando visita:', visit); // Debug

      // Verificar se a agência existe, se não, criar
      const { data: existingAgency } = await supabase
        .schema('insideview')
        .from('agencias')
        .select('id')
        .eq('nome', visit.realEstateAgency)
        .single();

      // Se não existir, criar a agência
      if (!existingAgency) {
        console.log('Criando nova agência:', visit.realEstateAgency);
        await supabase
          .schema('insideview')
          .from('agencias')
          .insert({
            nome: visit.realEstateAgency,
            ativo: true
          });
      }

      // Agora salvar a visita
      const now = new Date();

      const { data, error } = await supabase
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

      if (error) throw error;

      return {
        id: data.id.toString(),
        code: data.codigo || `V-${data.id}`,
        date: data.data,
        realEstateAgency: data.agencia,
        address: data.endereco || '',
        status: data.status,
        type: data.servico,
        value: parseFloat(data.valor) || 0,
        observations: data.observacoes || '',
        criado_em: data.criado_em,
        atualizado_em: data.atualizado_em
      };
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
      throw error;
    }
  },

  async updateVisit(visit: Visit): Promise<Visit> {
    try {
      const now = new Date();

      const { data, error } = await supabase
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

      if (error) throw error;

      return {
        id: data.id.toString(),
        code: data.codigo || `V-${data.id}`,
        date: data.data,
        realEstateAgency: data.agencia,
        address: data.endereco || '',
        status: data.status,
        type: data.servico,
        value: parseFloat(data.valor) || 0,
        observations: data.observacoes || '',
        criado_em: data.criado_em,
        atualizado_em: data.atualizado_em
      };
    } catch (error) {
      console.error('Erro ao atualizar visita:', error);
      throw error;
    }
  },

  async getVisitsForExport(agencyName: string, month: number, year: number): Promise<Visit[]> {
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

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((visit: any) => ({
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
      }));
    } catch (error) {
      console.error('Erro ao exportar visitas:', error);
      return [];
    }
  },

  async deleteVisit(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .schema('insideview')
        .from('visitas')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao excluir visita:', error);
      throw error;
    }
  }
};