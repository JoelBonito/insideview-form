import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Download, Filter, Edit, Eye, ChevronLeft, ChevronRight, Save, X, Calendar, MapPin, DollarSign, Tag, CheckCircle2, Clock, Ban, Building2, Trash2 } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import { RealEstateAgency, Visit, VisitStatus } from '../types';
import { Button, Input, Modal, Label, Select, TextArea } from './ui/LayoutComponents';
import { formatServiceType, getServiceTypeColor, getStatusColor, getStatusLabel, formatCurrency } from '../lib/utils-ui';
import * as XLSX from 'xlsx';

export default function TabSummary() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [agencies, setAgencies] = useState<RealEstateAgency[]>([]);
    const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'realizada' | 'pendente' | 'cancelada'>('all');
    const [filterAgency, setFilterAgency] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [editFormData, setEditFormData] = useState<Visit | null>(null);
    const [saving, setSaving] = useState(false);

    const loadVisits = async () => {
        setLoading(true);
        try {
            const [visitsData, agenciesData] = await Promise.all([
                sheetsService.getVisits(),
                sheetsService.getAgencies()
            ]);
            setVisits(visitsData);
            setFilteredVisits(visitsData);
            setAgencies(agenciesData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVisits();
    }, []);

    useEffect(() => {
        let result = visits;

        // 1. Text Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(v =>
                v.code.toLowerCase().includes(lower) ||
                v.address.toLowerCase().includes(lower) ||
                v.realEstateAgency.toLowerCase().includes(lower)
            );
        }

        // 2. Status Filter
        if (statusFilter !== 'all') {
            result = result.filter(v => v.status === statusFilter);
        }

        // 3. Agency Filter
        if (filterAgency) {
            result = result.filter(v => v.realEstateAgency === filterAgency);
        }

        // 4. Date Range Filter
        if (startDate) {
            // Create date object and set time to start of day
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            result = result.filter(v => new Date(v.date) >= start);
        }
        if (endDate) {
            // Create date object and set time to end of day
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            result = result.filter(v => new Date(v.date) <= end);
        }

        setFilteredVisits(result);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, filterAgency, startDate, endDate, visits]);

    const handleExportCSV = () => {
        const ws = XLSX.utils.json_to_sheet(filteredVisits);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Visits");
        XLSX.writeFile(wb, "resumo_visitas.csv");
    };

    // Modal Handlers
    const openModal = (visit: Visit, editMode: boolean = false) => {
        setSelectedVisit(visit);
        setEditFormData({ ...visit }); // Create a copy for editing
        setIsEditMode(editMode);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedVisit(null);
        setEditFormData(null);
        setIsEditMode(false);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (editFormData) {
            const { name, value } = e.target;
            setEditFormData({ ...editFormData, [name]: name === 'value' ? parseFloat(value) : value });
        }
    };

    const handleSaveVisit = async () => {
        if (!editFormData) return;
        setSaving(true);
        try {
            const updatedVisit = await sheetsService.updateVisit(editFormData);
            // Update local state directly
            setVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
            handleModalClose();
        } catch (error) {
            console.error("Failed to update visit", error);
            alert("Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };
    const handleDeleteVisit = async () => {
        if (!selectedVisit) return;

        if (!confirm("Tem certeza que deseja excluir esta visita? Esta ação não pode ser desfeita.")) {
            return;
        }

        setSaving(true);
        try {
            await sheetsService.deleteVisit(selectedVisit.id);
            setVisits(prev => prev.filter(v => v.id !== selectedVisit.id));
            handleModalClose();
        } catch (error) {
            console.error("Failed to delete visit", error);
            alert("Erro ao excluir visita.");
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    // Pagination Logic

    // Pagination Logic
    const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
    const currentItems = filteredVisits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const PaginationControls = () => (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Mostrando <span className="font-bold text-foreground">{currentItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> a <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, filteredVisits.length)}</span> de <span className="font-bold text-foreground">{filteredVisits.length}</span> resultados
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <div className="flex items-center gap-1">
                    <span className="text-sm px-2">Página {currentPage} de {totalPages || 1}</span>
                </div>
                <Button
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="w-full flex flex-col gap-4 animate-in fade-in duration-500">

            {/* Advanced Filters Area */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {/* Search Text */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Search className="size-4" />
                        </div>
                        <Input
                            placeholder="Buscar código ou endereço..."
                            className="pl-9 h-11 md:h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Agency Filter */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                            <Building2 className="size-4" />
                        </div>
                        <Select
                            value={filterAgency}
                            onChange={(e) => setFilterAgency(e.target.value)}
                            className="pl-9 h-11 md:h-12"
                        >
                            <option value="">Todas as Imobiliárias</option>
                            {agencies.map(a => (
                                <option key={a.id} value={a.name}>{a.name}</option>
                            ))}
                        </Select>
                    </div>

                    {/* Date Filters Grid (1 col on mobile for better touch area) */}
                    <div className="grid grid-cols-1 gap-3 md:contents">
                        {/* Date Start */}
                        <div className="relative lg:col-span-1">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                                <span className="text-[10px] font-bold">DE</span>
                            </div>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-9 h-11 md:h-12 text-xs md:text-sm appearance-none bg-muted/50 text-foreground w-full min-h-[44px] md:min-h-[48px] pt-[0.6rem]"
                            />
                        </div>

                        {/* Date End */}
                        <div className="relative lg:col-span-1">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
                                <span className="text-[10px] font-bold">ATÉ</span>
                            </div>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-10 h-11 md:h-12 text-xs md:text-sm appearance-none bg-muted/50 text-foreground w-full min-h-[44px] md:min-h-[48px] pt-[0.6rem]"
                            />
                        </div>
                    </div>
                </div>

                {/* Status Filter Tabs & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                        {(['all', 'realizada', 'pendente', 'cancelada'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`
                                flex h-9 shrink-0 items-center justify-center rounded-lg px-3 md:px-4 text-xs md:text-sm font-medium transition-colors border
                                ${statusFilter === status
                                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                        : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                                    }
                            `}
                            >
                                {getStatusLabel(status)}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button variant="outline" size="sm" onClick={loadVisits} disabled={loading} className="h-9 flex-1 sm:flex-none">
                            <RefreshCw className={`size-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            <span className="inline">Atualizar</span>
                        </Button>
                        <Button size="sm" onClick={handleExportCSV} className="h-9 flex-1 sm:flex-none">
                            <Download className="size-3.5 mr-2" />
                            <span className="inline">Exportar</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* MOBILE VIEW: Card Grid (Hidden on xl and up) */}
            <div className="xl:hidden flex flex-col gap-4">
                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Carregando dados...</div>
                ) : currentItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
                        Nenhuma visita encontrada.
                    </div>
                ) : (
                    currentItems.map((visit) => (
                        <div
                            key={visit.id}
                            onClick={() => openModal(visit, false)}
                            className="bg-card border border-border rounded-xl p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex flex-col gap-3"
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-xs font-bold bg-background px-2 py-1 rounded border border-border text-foreground">
                                    {visit.code}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-bold border ${getStatusColor(visit.status)}`}>
                                    <span className="size-1.5 rounded-full bg-current"></span>
                                    {getStatusLabel(visit.status)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <h4 className="font-bold text-foreground line-clamp-2">{visit.address}</h4>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Building2 className="size-3" />
                                    {visit.realEstateAgency}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Calendar className="size-3" />
                                        {visit.criado_em ? new Date(visit.criado_em).toLocaleDateString('pt-BR') : 'N/A'}
                                    </div>
                                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium w-fit mt-1 border ${getServiceTypeColor(visit.type)}`}>
                                        {formatServiceType(visit.type)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-foreground block">
                                        {formatCurrency(visit.value)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Mobile Pagination */}
                {!loading && currentItems.length > 0 && (
                    <div className="bg-card rounded-xl border border-border">
                        <PaginationControls />
                    </div>
                )}
            </div>

            {/* DESKTOP VIEW: Table (Hidden on small screens) */}
            <div className="hidden xl:flex rounded-xl border border-border bg-card shadow-sm overflow-hidden flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-collapse text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-24">Código</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-40">Data e Hora</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Endereço</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-32">Tipo</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right w-32">Valor</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Observações</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-32">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Carregando dados...</td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Nenhuma visita encontrada com os filtros selecionados.</td>
                                </tr>
                            ) : (
                                currentItems.map((visit) => (
                                    <tr
                                        key={visit.id}
                                        className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => openModal(visit, false)}
                                    >
                                        <td className="px-6 py-4 align-top">
                                            <span className="font-mono text-sm font-semibold text-foreground bg-background px-2 py-1 rounded border border-border">
                                                {visit.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground align-top">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{visit.criado_em ? new Date(visit.criado_em).toLocaleDateString('pt-BR') : 'N/A'}</span>
                                                <span className="text-xs">{visit.criado_em ? new Date(visit.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground truncate max-w-[200px]" title={visit.address}>{visit.address}</span>
                                                <span className="text-xs text-muted-foreground">{visit.realEstateAgency}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground align-top">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${getServiceTypeColor(visit.type)}`}>
                                                {formatServiceType(visit.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-foreground align-top text-right">
                                            {formatCurrency(visit.value)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground align-top">
                                            <p className="line-clamp-2 max-w-[200px]" title={visit.observations || '-'}>
                                                {visit.observations || '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-bold border ${getStatusColor(visit.status)}`}>
                                                <span className="size-1.5 rounded-full bg-current"></span>
                                                {getStatusLabel(visit.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Desktop Pagination Footer */}
                <div className="border-t border-border bg-muted/20">
                    <PaginationControls />
                </div>
            </div>

            {/* View/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                title={isEditMode ? `Editar Visita ${selectedVisit?.code}` : `Detalhes da Visita ${selectedVisit?.code}`}
                actions={!isEditMode && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVisit()}
                            className="text-destructive hover:bg-destructive/10 border-destructive px-3"
                            title="Excluir Visita"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditMode(true)}
                            className="px-3"
                            title="Editar Visita"
                        >
                            <Edit className="size-4" />
                        </Button>
                    </div>
                )}
            >
                {editFormData && (
                    <div className="flex flex-col gap-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-code">Código</Label>
                                <Input
                                    id="edit-code"
                                    name="code"
                                    value={editFormData.code}
                                    onChange={handleEditChange}
                                    disabled={!isEditMode}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-date">Data e Hora</Label>
                                <Input
                                    id="edit-date"
                                    type="datetime-local"
                                    name="date"
                                    // Ensure the date is in YYYY-MM-DDThh:mm format for datetime-local
                                    value={(() => {
                                        if (!editFormData.date) return '';
                                        // If it's just a date (YYYY-MM-DD), append time from criado_em or default to midnight
                                        if (editFormData.date.length <= 10) {
                                            const timePart = editFormData.criado_em ? editFormData.criado_em.split('T')[1]?.slice(0, 5) : '00:00';
                                            return `${editFormData.date}T${timePart || '00:00'}`;
                                        }
                                        return editFormData.date.slice(0, 16);
                                    })()}
                                    onChange={(e) => setEditFormData({ ...editFormData, date: new Date(e.target.value).toISOString() })}
                                    disabled={!isEditMode}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-agency">Imobiliária</Label>
                                <Select
                                    id="edit-agency"
                                    name="realEstateAgency"
                                    value={editFormData.realEstateAgency}
                                    onChange={handleEditChange}
                                    disabled={!isEditMode}
                                >
                                    {agencies.map(a => (
                                        <option key={a.id} value={a.name}>{a.name}</option>
                                    ))}
                                    {/* Add current agency if not in list to prevent it being lost */}
                                    {!agencies.find(a => a.name === editFormData.realEstateAgency) && (
                                        <option value={editFormData.realEstateAgency}>{editFormData.realEstateAgency}</option>
                                    )}
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-address">Endereço</Label>
                                <Input
                                    id="edit-address"
                                    name="address"
                                    value={editFormData.address}
                                    onChange={handleEditChange}
                                    disabled={!isEditMode}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-type">Tipo de Serviço</Label>
                                <Select
                                    id="edit-type"
                                    name="type"
                                    value={editFormData.type}
                                    onChange={handleEditChange}
                                    disabled={!isEditMode}
                                >
                                    <option value="fotos">Fotos</option>
                                    <option value="tour_virtual">Tour Virtual</option>
                                    <option value="fotos_tour">Fotos + Tour</option>
                                    {/* Preserve custom types */}
                                    {['fotos', 'tour_virtual', 'fotos_tour'].indexOf(editFormData.type) === -1 && (
                                        <option value={editFormData.type}>{editFormData.type}</option>
                                    )}
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-value">Valor (R$)</Label>
                                <Input
                                    id="edit-value"
                                    name="value"
                                    type="number"
                                    value={editFormData.value}
                                    onChange={handleEditChange}
                                    disabled={!isEditMode}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Status</Label>
                            <div className="flex gap-2">
                                {[
                                    { id: 'realizada', label: 'Realizada', icon: CheckCircle2, color: 'success' },
                                    { id: 'pendente', label: 'Pendente', icon: Clock, color: 'warning' },
                                    { id: 'cancelada', label: 'Não Realizada', icon: Ban, color: 'error' }
                                ].map(status => (
                                    <button
                                        key={status.id}
                                        type="button"
                                        disabled={!isEditMode}
                                        onClick={() => setEditFormData({ ...editFormData, status: status.id as VisitStatus })}
                                        className={`
                                        flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-bold transition-all
                                         ${editFormData.status === status.id
                                                ? `bg-${status.color} text-${status.color}-foreground border-${status.color} shadow-md`
                                                : `bg-card border-border text-muted-foreground ${isEditMode ? 'hover:bg-accent' : 'opacity-60'}`
                                            }
                                    `}
                                    >
                                        <status.icon className="size-4" />
                                        <span className="hidden sm:inline">{status.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="edit-obs">Observações</Label>
                            <TextArea
                                id="edit-obs"
                                name="observations"
                                value={editFormData.observations || ''}
                                onChange={handleEditChange}
                                disabled={!isEditMode}
                            />
                        </div>

                        {/* Actions */}
                        {isEditMode && (
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
                                <Button variant="ghost" onClick={() => { setIsEditMode(false); setEditFormData({ ...selectedVisit! }); }}>
                                    Cancelar Edição
                                </Button>
                                <Button onClick={handleSaveVisit} disabled={saving}>
                                    <Save className="size-4 mr-2" />
                                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}