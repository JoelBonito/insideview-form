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
            <div className="bg-card rounded-xl p-5 md:p-6 border border-border shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end gap-4 md:gap-6">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                            <Building2 className="size-4 text-primary" />
                            Imobiliária
                        </label>
                        <Select
                            value={selectedAgency}
                            onChange={(e) => setSelectedAgency(e.target.value)}
                            className="h-11 md:h-12"
                        >
                            <option value="" disabled>Selecione a Imobiliária</option>
                            <option value="all">Todas as Imobiliárias</option>
                            {agencies.map(a => (
                                <option key={a.id} value={a.name}>{a.name}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:contents">
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                                <Calendar className="size-4 text-primary" />
                                Mês
                            </label>
                            <Select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="h-11 md:h-12"
                            >
                                <option value="" disabled>Selecione o mês</option>
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="lg:col-span-1">
                            <label className="block text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                                <Calendar className="size-4 text-primary" />
                                Ano
                            </label>
                            <Select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="h-11 md:h-12"
                            >
                                <option value="" disabled>Selecione o ano</option>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="lg:col-span-1 flex items-end">
                        <Button
                            onClick={handleExportExcel}
                            disabled={previewVisits.length === 0}
                            className="w-full h-11 md:h-12 font-bold shadow-lg shadow-primary/20"
                        >
                            <Download className="size-4 mr-2" />
                            Exportar Excel
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
                <div className="p-4 md:p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-foreground">Relatório Gerado</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Mostrando {previewVisits.length} registros no período</p>
                    </div>
                </div>

                {/* MOBILE VIEW: Card List */}
                <div className="xl:hidden divide-y divide-border">
                    {previewVisits.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Nenhum registro encontrado.
                        </div>
                    ) : (
                        previewVisits.map((visit) => (
                            <div key={visit.id} className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <span className="font-mono text-[10px] font-bold bg-background px-1.5 py-0.5 rounded border border-border">
                                        {visit.code}
                                    </span>
                                    <span className="text-sm font-bold text-foreground">
                                        {formatCurrency(visit.value)}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground line-clamp-2">{visit.address}</h4>
                                    <p className="text-xs text-muted-foreground">{visit.realEstateAgency}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] items-center rounded-md px-1.5 py-0.5 font-medium border ${getServiceTypeColor(visit.type)}`}>
                                        {formatServiceType(visit.type)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(visit.date).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    {previewVisits.length > 0 && (
                        <div className="p-4 bg-primary/5 flex justify-between items-center">
                            <span className="text-sm font-bold text-primary">TOTAL</span>
                            <span className="text-lg font-black text-primary">{formatCurrency(totalValue)}</span>
                        </div>
                    )}
                </div>

                {/* DESKTOP VIEW: Table */}
                <div className="hidden xl:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Imobiliária</th>
                                <th className="px-6 py-4">Endereço</th>
                                <th className="px-4 py-4">Serviço</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                <th className="px-6 py-4">Obs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {previewVisits.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                        Selecione os filtros acima para visualizar os dados.
                                    </td>
                                </tr>
                            ) : (
                                previewVisits.map((visit) => (
                                    <tr key={visit.id} className="hover:bg-accent/30 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            {new Date(visit.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold">{visit.realEstateAgency}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-[200px]" title={visit.address}>
                                            {visit.address}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium border ${getServiceTypeColor(visit.type)}`}>
                                                {formatServiceType(visit.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-right text-foreground">
                                            {formatCurrency(visit.value)}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground max-w-[150px] truncate">
                                            {visit.observations || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {previewVisits.length > 0 && (
                            <tfoot className="bg-primary/5 border-t-2 border-primary/20">
                                <tr>
                                    <td colSpan={4} className="px-6 py-5 text-sm font-black text-primary text-right uppercase tracking-wider">TOTAL DO PERÍODO</td>
                                    <td className="px-6 py-5 text-lg font-black text-primary text-right">
                                        {formatCurrency(totalValue)}
                                    </td>
                                    <td className="px-6 py-5"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}