import React, { useEffect, useState } from 'react';
import { Download, Search, Calendar, Building2 } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import { RealEstateAgency, Visit } from '../types';
import { Button, Select } from './ui/LayoutComponents';
import { formatServiceType, getServiceTypeColor, getStatusColor, getStatusLabel, formatCurrency } from '../lib/utils-ui';
import * as XLSX from 'xlsx';

export default function TabListings() {
    const [agencies, setAgencies] = useState<RealEstateAgency[]>([]);
    const [previewVisits, setPreviewVisits] = useState<Visit[]>([]);

    const [selectedAgency, setSelectedAgency] = useState('');
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        sheetsService.getAgencies().then(setAgencies);
    }, []);

    const handleFilter = async () => {
        if (!selectedAgency || !selectedMonth || !selectedYear) return;

        const month = parseInt(selectedMonth);
        const year = parseInt(selectedYear);

        const visits = await sheetsService.getVisitsForExport(selectedAgency, month - 1, year);
        setPreviewVisits(visits);
    };

    const handleExportExcel = async () => {
        if (previewVisits.length === 0) return;

        try {
            // Tenta carregar o modelo personalizado
            const response = await fetch('/template.xlsx');
            if (!response.ok) throw new Error('Modelo não encontrado');

            const arrayBuffer = await response.arrayBuffer();
            const wb = XLSX.read(arrayBuffer, { type: 'array' });

            // Assume o primeiro sheet como o de dados
            const wsName = wb.SheetNames[0];
            const ws = wb.Sheets[wsName];

            const dataToExport = previewVisits.map(v => ({
                "ID Visita": v.code,
                "Data": new Date(v.date).toLocaleDateString('pt-BR'),
                "Imobiliária": v.realEstateAgency,
                "Endereço": v.address,
                "Valor": v.value,
                "Status": v.status,
                "Serviço": v.type,
                "Observações": v.observations || '-'
            }));

            // Adiciona os dados começando da segunda linha (A2) pulando o header (que já deve estar no modelo)
            XLSX.utils.sheet_add_json(ws, dataToExport, { origin: "A2", skipHeader: true });

            // Adiciona a linha de TOTAL no final
            const lastRowIndex = dataToExport.length + 1;
            XLSX.utils.sheet_add_aoa(ws, [
                ["TOTAL", "", "", "", totalValue]
            ], { origin: `A${lastRowIndex + 1}` });

            const fileName = selectedAgency === 'all' ? 'todas_imobiliarias' : selectedAgency;
            XLSX.writeFile(wb, `relatorio_${fileName}_${selectedMonth}_${selectedYear}.xlsx`);

        } catch (error) {
            console.error('Erro ao processar template Excel, usando exportação padrão:', error);

            // Fallback para exportação padrão caso o template falhe
            const dataToExport = previewVisits.map(v => ({
                "ID Visita": v.code,
                "Data": new Date(v.date).toLocaleDateString('pt-BR'),
                "Imobiliária": v.realEstateAgency,
                "Endereço": v.address,
                "Valor": v.value,
                "Status": v.status,
                "Serviço": v.type,
                "Observações": v.observations || '-'
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);

            // Adiciona linha de total no fallback também
            XLSX.utils.sheet_add_aoa(ws, [
                ["TOTAL", "", "", "", totalValue]
            ], { origin: -1 });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Relatório");

            const fileName = selectedAgency === 'all' ? 'todas_imobiliarias' : selectedAgency;
            XLSX.writeFile(wb, `relatorio_${fileName}_${selectedMonth}_${selectedYear}.xlsx`);
        }
    };

    const months = [
        { value: '1', label: 'Janeiro' },
        { value: '2', label: 'Fevereiro' },
        { value: '3', label: 'Março' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Maio' },
        { value: '6', label: 'Junho' },
        { value: '7', label: 'Julho' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Setembro' },
        { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' },
        { value: '12', label: 'Dezembro' },
    ];

    const years = Array.from({ length: 2099 - 2025 + 1 }, (_, i) => (2025 + i).toString());

    const totalValue = previewVisits.reduce((acc, visit) => acc + visit.value, 0);

    return (
        <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">

            {/* Filter Card */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <div className="flex flex-wrap items-end gap-6">
                    <div className="flex-1 min-w-[280px]">
                        <label className="block text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                            <Building2 className="size-4 text-primary" />
                            Imobiliária
                        </label>
                        <Select
                            value={selectedAgency}
                            onChange={(e) => setSelectedAgency(e.target.value)}
                        >
                            <option value="" disabled>Selecione a Imobiliária</option>
                            <option value="all">Todas as Imobiliárias</option>
                            {agencies.map(a => (
                                <option key={a.id} value={a.name}>{a.name}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                            <Calendar className="size-4 text-primary" />
                            Mês
                        </label>
                        <Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <option value="" disabled>Selecione o mês</option>
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                            <Calendar className="size-4 text-primary" />
                            Ano
                        </label>
                        <Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="" disabled>Selecione o ano</option>
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="w-full md:w-auto">
                        <Button
                            variant="secondary"
                            className="w-full md:w-auto"
                            onClick={handleFilter}
                        >
                            <Search className="size-5 mr-2" />
                            Filtrar Visitas
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold text-foreground">Pré-visualização dos Dados</h3>
                    <Button onClick={handleExportExcel} disabled={previewVisits.length === 0}>
                        <Download className="size-5 mr-2" />
                        Baixar Excel (.xlsx)
                    </Button>
                </div>

                <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">ID Visita</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Data</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Imobiliária</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Endereço</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Valor</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Serviço</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Observações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {previewVisits.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground italic">
                                            Selecione os filtros acima para visualizar os dados.
                                        </td>
                                    </tr>
                                ) : (
                                    previewVisits.map(visit => (
                                        <tr key={visit.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">{visit.code}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{new Date(visit.date).toLocaleDateString('pt-BR')}</td>
                                            <td className="px-6 py-4 text-foreground">{visit.realEstateAgency}</td>
                                            <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">{visit.address}</td>
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                {formatCurrency(visit.value)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground align-top">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${getServiceTypeColor(visit.type)}`}>
                                                    {formatServiceType(visit.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusColor(visit.status)}`}>
                                                    {getStatusLabel(visit.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground whitespace-pre-wrap max-w-[200px]">
                                                {visit.observations || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {previewVisits.length > 0 && (
                                <tfoot className="bg-muted/50 font-bold">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-right">TOTAL</td>
                                        <td className="px-6 py-4 text-primary">{formatCurrency(totalValue)}</td>
                                        <td colSpan={3}></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                    {/* Footer metadata */}
                    {previewVisits.length > 0 && (
                        <div className="px-6 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
                            Total de registros: {previewVisits.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}