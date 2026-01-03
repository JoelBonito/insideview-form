export const formatServiceType = (type: string) => {
    const map: Record<string, string> = {
        'fotos': 'Fotos',
        'tour_virtual': 'Tour Virtual',
        'fotos_tour': 'Fotos + Tour',
    };
    return map[type] || type;
};

export const getServiceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        'fotos': 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
        'tour_virtual': 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400',
        'fotos_tour': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    };
    return colors[type] || 'bg-accent text-foreground border-border';
};

export const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        'realizada': 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
        'pendente': 'border-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
        'cancelada': 'border-[hsl(var(--error))] bg-[hsl(var(--error))]/10 text-[hsl(var(--error))]',
        'em_andamento': 'border-[hsl(var(--info))] bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]',
    };
    return colors[status] || 'border-border bg-accent/50 text-muted-foreground';
};

export const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        'realizada': 'Realizada',
        'pendente': 'Pendente',
        'cancelada': 'Não Realizada',
        'em_andamento': 'Em Andamento',
        'all': 'Todos'
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

export const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(val);
};
