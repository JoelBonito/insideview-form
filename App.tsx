import React, { useState } from 'react';
import { Camera, LayoutDashboard, FileText, Settings, User, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import TabRegistration from './components/TabRegistration';
import TabSummary from './components/TabSummary';
import TabListings from './components/TabListings';
import { Tab } from './types';

export default function App() {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.REGISTRATION);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(newTheme);
    };

    const renderContent = () => {
        switch (activeTab) {
            case Tab.REGISTRATION: return <TabRegistration />;
            case Tab.SUMMARY: return <TabSummary />;
            case Tab.LISTINGS: return <TabListings />;
            default: return <TabRegistration />;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col xl:flex-row font-body transition-colors duration-300">

            {/* Sidebar (Desktop) / Bottom Nav (Mobile/Tablet) */}
            <aside className={`w-full bg-sidebar border-r border-border flex flex-col fixed xl:relative bottom-0 xl:h-screen z-50 order-2 xl:order-1 transition-all duration-300 ${sidebarCollapsed ? 'xl:w-20' : 'xl:w-64'
                }`}>

                {/* Logo Area - Centralizada */}
                <div className="hidden xl:flex flex-col items-center justify-center p-6 border-b border-border relative">
                    <img
                        src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
                        alt="Insideview 360"
                        className={`transition-all duration-300 ${sidebarCollapsed ? 'w-12 h-12 object-contain' : 'w-32 h-auto'
                            }`}
                    />
                    {/* Botão de recolher - posicionado sobre a borda horizontal */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="absolute -right-3 -bottom-3 size-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-sm z-10"
                    >
                        {sidebarCollapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 xl:p-4 flex flex-row xl:flex-col gap-2 overflow-x-auto xl:overflow-visible bg-sidebar xl:bg-transparent justify-around xl:justify-start pb-[calc(1rem+env(safe-area-inset-bottom))] xl:pb-4 px-6 xl:px-4">
                    {[
                        { id: Tab.REGISTRATION, label: 'Nova Visita', icon: Camera },
                        { id: Tab.SUMMARY, label: 'Visitas', icon: LayoutDashboard },
                        { id: Tab.LISTINGS, label: 'Relatórios', icon: FileText },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`
                        flex flex-col xl:flex-row items-center gap-1 xl:gap-3 px-3 xl:px-4 py-2 xl:py-3 rounded-lg text-[10px] xl:text-sm font-medium transition-all w-auto xl:w-full
                        ${activeTab === item.id
                                    ? 'bg-sidebar-active text-sidebar-activeFg border-b-2 xl:border-b-0 xl:border-l-4 border-sidebar-border shadow-sm'
                                    : 'text-sidebar-fg hover:bg-accent hover:text-foreground'
                                }
                    `}
                            title={item.label}
                        >
                            <item.icon className="size-5 xl:size-5" />
                            <span className={sidebarCollapsed ? 'hidden' : 'inline'}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Powered by Footer */}
                <div className="hidden xl:flex p-4 border-t border-border flex-col items-center gap-2">
                    <span className={`text-[10px] font-semibold text-muted-foreground tracking-wider transition-opacity ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'
                        }`}>POWERED BY</span>
                    <img
                        src="/inove-ai-logo.jpg"
                        alt="Inove AI"
                        className={`transition-all duration-300 rounded ${sidebarCollapsed ? 'w-8 h-8' : 'w-12 h-12'
                            }`}
                    />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen relative order-1 xl:order-2">
                {/* TopBar Flutuante com Blur Effect */}
                <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
                    <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-3 xl:py-4">
                        {/* Logo Mobile (mobile + tablet) */}
                        <div className="flex xl:hidden items-center gap-2">
                            <img src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} alt="Insideview 360" className="h-8 md:h-10" />
                        </div>

                        {/* Título da Página (Desktop) */}
                        <h1 className="hidden xl:block text-2xl font-bold text-foreground">
                            {activeTab === Tab.REGISTRATION ? 'Nova Visita' :
                                activeTab === Tab.SUMMARY ? 'Visitas' :
                                    activeTab === Tab.LISTINGS ? 'Relatórios' : ''}
                        </h1>

                        {/* User & Theme Controls */}
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Theme Toggle - Estilo Pill */}
                            <div className="flex items-center bg-card border border-border rounded-full p-1">
                                <button
                                    onClick={() => { if (theme !== 'light') toggleTheme(); }}
                                    className={`p-1.5 md:p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    title="Modo Claro"
                                >
                                    <Sun className="size-3.5 md:size-4" />
                                </button>
                                <button
                                    onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                                    className={`p-1.5 md:p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    title="Modo Escuro"
                                >
                                    <Moon className="size-3.5 md:size-4" />
                                </button>
                            </div>

                            {/* User Avatar & Name */}
                            <div className="flex items-center gap-2 pl-1 pr-1 md:pr-3 py-1.5 md:py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                                <div className="size-8 md:size-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs md:text-sm">
                                    EP
                                </div>
                                <div className="hidden lg:flex flex-col">
                                    <span className="text-sm font-semibold leading-none">Evelyn Porto</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-0.5">Fotógrafa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 pb-[calc(6rem+env(safe-area-inset-bottom))] xl:pb-12">
                    {renderContent()}
                </div>
            </main>

        </div>
    );
}