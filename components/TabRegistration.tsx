import React, { useState, useEffect } from 'react';
import { Camera, Save, MapPin, DollarSign, Image as ImageIcon, Video, Layers, PlusCircle, X, CheckCircle2, Clock, Ban } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import { RealEstateAgency, VisitStatus } from '../types';
import { Button, Card, Input, Label, Select, TextArea } from './ui/LayoutComponents';
import { getTodayDateString } from '../lib/utils-ui';

export default function TabRegistration() {
    const [agencies, setAgencies] = useState<RealEstateAgency[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        realEstateAgency: '',
        address: '',
        type: 'fotos',
        value: '',
        observations: '',
        status: 'pendente' as VisitStatus
    });

    // Custom inputs state
    const [customService, setCustomService] = useState('');
    const [isNewAgency, setIsNewAgency] = useState(false);
    const [customAgency, setCustomAgency] = useState('');

    useEffect(() => {
        sheetsService.getAgencies().then(setAgencies);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Handle Agency Selection logic
        if (name === 'realEstateAgency') {
            if (value === 'new_agency_option') {
                setIsNewAgency(true);
                setFormData(prev => ({ ...prev, [name]: '' }));
            } else {
                setIsNewAgency(false);
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Determine the final values
        const finalType = formData.type === 'outros' ? customService : formData.type;
        const finalAgency = isNewAgency ? customAgency : formData.realEstateAgency;

        // Validations
        if (isNewAgency && !customAgency.trim()) {
            alert("Por favor, digite o nome da nova imobiliária.");
            setLoading(false);
            return;
        }

        if (!finalAgency) {
            alert("Por favor, selecione ou informe uma imobiliária.");
            setLoading(false);
            return;
        }

        if (formData.type === 'outros' && !customService.trim()) {
            alert("Por favor, especifique o tipo de serviço.");
            setLoading(false);
            return;
        }

        try {
            await sheetsService.saveVisit({
                ...formData,
                realEstateAgency: finalAgency,
                date: getTodayDateString(),
                type: finalType,
                value: parseFloat(formData.value) || 0
            });
            setSuccess(true);
            alert('✅ Visita salva com sucesso!');
            // Reset form
            setFormData({
                code: '',
                realEstateAgency: '',
                address: '',
                type: 'fotos',
                value: '',
                observations: '',
                status: 'pendente'
            });
            setCustomService('');
            setCustomAgency('');
            setIsNewAgency(false);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setLoading(false);
        }
    };

    const serviceTypes = [
        { id: 'fotos', label: 'Fotos' },
        { id: 'tour_virtual', label: 'Tour Virtual' },
        { id: 'fotos_tour', label: 'Fotos + Tour Virtual' },
        { id: 'outros', label: 'Outros...' }
    ];

    const statusOptions = [
        { id: 'realizada', label: 'Realizada', icon: CheckCircle2, activeClass: 'bg-success text-success-foreground border-success', inactiveClass: 'text-success border-success/30 hover:bg-success/10' },
        { id: 'pendente', label: 'Pendente', icon: Clock, activeClass: 'bg-warning text-warning-foreground border-warning', inactiveClass: 'text-warning border-warning/30 hover:bg-warning/10' },
        { id: 'cancelada', label: 'Não Realizada', icon: Ban, activeClass: 'bg-error text-error-foreground border-error', inactiveClass: 'text-error border-error/30 hover:bg-error/10' },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">

            <Card className="p-5 md:p-8 bg-card border-border">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Header Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                            <Camera className="text-primary size-5" />
                            Dados da Visita
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-2 sm:col-span-1">
                                <Label htmlFor="code">Código</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    placeholder="Ex: 12345"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    className="h-11 md:h-12"
                                />
                            </div>
                            <div className="flex flex-col gap-2 sm:col-span-3">
                                <Label htmlFor="agency">Imobiliária</Label>
                                {isNewAgency ? (
                                    <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                                        <Input
                                            placeholder="Nome da nova imobiliária"
                                            value={customAgency}
                                            onChange={(e) => setCustomAgency(e.target.value)}
                                            autoFocus
                                            className="flex-1 h-11 md:h-12"
                                            required={isNewAgency}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsNewAgency(false);
                                                setCustomAgency('');
                                                setFormData(prev => ({ ...prev, realEstateAgency: '' }))
                                            }}
                                            className="shrink-0 px-3 h-11 md:h-12"
                                            title="Cancelar"
                                        >
                                            <X className="size-5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Select
                                        id="agency"
                                        name="realEstateAgency"
                                        value={formData.realEstateAgency}
                                        onChange={handleChange}
                                        required={!isNewAgency}
                                        className="h-11 md:h-12"
                                    >
                                        <option value="" disabled>Selecione a imobiliária...</option>
                                        {agencies.map(agency => (
                                            <option key={agency.id} value={agency.name}>{agency.name}</option>
                                        ))}
                                        <option value="new_agency_option" className="font-semibold text-primary">+ Adicionar nova imobiliária</option>
                                    </Select>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="address">Endereço Completo</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <MapPin className="size-5" />
                                </div>
                                <Input
                                    id="address"
                                    name="address"
                                    className="pl-10 h-11 md:h-12"
                                    placeholder="Rua, Número, Bairro, Cidade"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Details Row - Service Type & Value Side-by-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="type">Tipo de Serviço</Label>
                            <Select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="h-11 md:h-12"
                            >
                                {serviceTypes.map(t => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="value">Valor (R$)</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground font-medium">
                                    R$
                                </div>
                                <Input
                                    id="value"
                                    name="value"
                                    className="pl-9 h-11 md:h-12"
                                    placeholder="0,00"
                                    type="number"
                                    step="0.01"
                                    value={formData.value}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Custom Service Input - Shows only if "Outros" is selected */}
                    {formData.type === 'outros' && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <Label htmlFor="customService" className="mb-2 block">Especifique o serviço</Label>
                            <Input
                                id="customService"
                                placeholder="Digite o nome do serviço..."
                                value={customService}
                                onChange={(e) => setCustomService(e.target.value)}
                                autoFocus
                                required
                                className="h-11 md:h-12"
                            />
                        </div>
                    )}

                    {/* Status Selection */}
                    <div className="flex flex-col gap-2">
                        <Label>Status</Label>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {statusOptions.map((status) => (
                                <button
                                    key={status.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, status: status.id as VisitStatus }))}
                                    className={`
                                    flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-1 rounded-lg border font-bold text-[10px] sm:text-sm transition-all
                                    ${formData.status === status.id
                                            ? status.activeClass + ' shadow-md scale-[1.02]'
                                            : 'bg-card ' + status.inactiveClass
                                        }
                                `}
                                >
                                    <status.icon className="size-4" />
                                    <span>{status.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Observations */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="obs">Observações</Label>
                        <TextArea
                            id="obs"
                            name="observations"
                            placeholder="Detalhes adicionais sobre a visita..."
                            rows={4}
                            className="resize-none text-sm"
                            value={formData.observations}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-border mt-2">
                        <Button type="button" variant="ghost" className="h-11 md:h-12 flex-1 sm:flex-none">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="h-11 md:h-12 flex-1 sm:flex-none">
                            {loading ? 'Salvando...' : (
                                <>
                                    <Save className="size-5 mr-1.5 md:mr-2" />
                                    Salvar
                                </>
                            )}
                        </Button>
                    </div>
                    {success && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm text-center font-medium animate-in fade-in">
                            Visita cadastrada com sucesso!
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
}