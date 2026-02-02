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

/**
 * Formata uma string date-only (YYYY-MM-DD) para dd/mm/aaaa sem conversão de timezone.
 * Evita o bug de new Date("YYYY-MM-DD") interpretar como UTC e exibir -1 dia em fusos negativos.
 */
export const formatDateBR = (dateStr: string): string => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
};

/**
 * Retorna a data local atual no formato YYYY-MM-DD, sem depender de UTC.
 */
export const getTodayDateString = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

/**
 * Compara duas strings date-only (YYYY-MM-DD) sem conversão de timezone.
 * Retorna negativo se a < b, 0 se iguais, positivo se a > b.
 */
export const compareDates = (a: string, b: string): number => {
    return a.split('T')[0].localeCompare(b.split('T')[0]);
};

export const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(val);
};
