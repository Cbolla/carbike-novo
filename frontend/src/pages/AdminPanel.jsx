import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3, Users, Car, CheckCircle, Megaphone,
    Shield, AlertTriangle, LogOut, Search, Trash2,
    Menu, X, Edit, Power, Star, Calendar, ArrowRight,
    TrendingUp, Activity, MessageSquare, Download, MoreHorizontal,
    Store, Wallet, Settings, LayoutDashboard, Play, Mail, MapPin
} from 'lucide-react';

const API_URL = 'http://localhost:3000';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('summary');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [data, setData] = useState([]); // Versátil para usuários, veículos, etc.
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState('all'); // 'all' | 'lojas' | 'particulares' | 'bloqueados'
    const [vehicleFilter, setVehicleFilter] = useState('all'); // 'all' | 'bloqueados'
    const [modalConfig, setModalConfig] = useState(null); // Sistema de Popup Moderno

    // Sincroniza Admin logado
    useEffect(() => {
        const adminStr = localStorage.getItem('carbike_admin');
        const token = localStorage.getItem('carbike_admin_token');

        if (!adminStr || !token) {
            navigate('/admin/login');
            return;
        }
        setAdminData(JSON.parse(adminStr));
    }, [navigate]);

    // Busca dados dinâmicos baseados na TAB ativa
    useEffect(() => {
        if (adminData) {
            fetchData();
        }
    }, [activeTab, adminData]);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('carbike_admin_token');
        const endpoint = `/admin/${activeTab === 'summary' ? 'summary' : activeTab}`;

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();

            if (activeTab === 'summary') {
                setStats(result);
            } else if (activeTab === 'users') {
                setData(result.users || []);
            } else if (activeTab === 'vehicles') {
                setData(result.vehicles || []);
            } else if (activeTab === 'requests') {
                setData(result); // pendingUsers e pendingCars
            } else if (activeTab === 'simulations') {
                setData(result.simulations || []);
            }
        } catch (error) {
            console.error("Erro ao buscar dados Admin:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('carbike_admin_token');
        localStorage.removeItem('carbike_admin');
        navigate('/admin/login');
    };

    const closeModal = () => setModalConfig(null);

    const handlePauseUser = async (user) => {
        setModalConfig({
            isOpen: true,
            title: 'Bloquear Parceiro',
            message: `Você está prestes a bloquear o acesso de ${user.name}. Essa loja não conseguirá mais entrar no sistema usando suas credenciais até ser reativada.`,
            confirmText: 'Pausar Parceiro',
            cancelText: 'Pular, Manter Ativo',
            type: 'warning',
            onConfirm: async () => {
                const token = localStorage.getItem('carbike_admin_token');
                try {
                    await fetch(`${API_URL}/admin/users/${user.id}/pause`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchData();
                    closeModal();
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleUnpauseUser = async (user) => {
        setModalConfig({
            isOpen: true,
            title: 'Reativar Parceiro',
            message: `O parceiro ${user.name} voltará a ter acesso ao sistema e seus veículos cadastrados voltarão a circular na plataforma. Deseja reativar?`,
            confirmText: 'Sim, Reativar Agora',
            cancelText: 'Pular',
            type: 'success',
            onConfirm: async () => {
                const token = localStorage.getItem('carbike_admin_token');
                try {
                    await fetch(`${API_URL}/admin/users/${user.id}/unpause`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchData();
                    closeModal();
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleEditUser = (user) => {
        setModalConfig({
            isOpen: true,
            title: 'Editar Parceiro',
            message: 'Altere as informações cadastrais abaixo:',
            confirmText: 'Salvar Alterações',
            cancelText: 'Descartar',
            type: 'edit',
            user: user,
            onConfirm: async () => {
                const name = document.getElementById('edit_name')?.value;
                const email = document.getElementById('edit_email')?.value;
                const phone_number = document.getElementById('edit_phone')?.value;
                const phone_number2 = document.getElementById('edit_phone2')?.value;
                const cep = document.getElementById('edit_cep')?.value;
                const state = document.getElementById('edit_state')?.value;
                const city = document.getElementById('edit_city')?.value;
                const district = document.getElementById('edit_district')?.value;
                const street = document.getElementById('edit_street')?.value;
                const number = document.getElementById('edit_number')?.value;
                const complement = document.getElementById('edit_complement')?.value;

                const token = localStorage.getItem('carbike_admin_token');
                try {
                    await fetch(`${API_URL}/admin/users/${user.id}`, {
                        method: 'PUT',
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            name, email, phone_number, phone_number2, 
                            cep, state, city, district, street, number, complement 
                        })
                    });
                    fetchData();
                    closeModal();
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleDeleteUser = async (user) => {
        setModalConfig({
            isOpen: true,
            title: 'Excluir Definitivamente',
            message: `Atenção: A loja/particular ${user.name} será deletada permanentemente e todos os vínculos ao sistema serão apagados. Continuar?`,
            confirmText: 'Sim, excluir para sempre',
            cancelText: 'Cancelar Ação',
            type: 'danger',
            onConfirm: async () => {
                const token = localStorage.getItem('carbike_admin_token');
                try {
                    await fetch(`${API_URL}/admin/users/${user.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchData();
                    closeModal();
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleEditVehicle = (vehicle) => {
        setModalConfig({
            isOpen: true,
            title: 'Editar Anúncio',
            message: 'Altere as informações do veículo.',
            confirmText: 'Salvar Alterações',
            cancelText: 'Descartar',
            type: 'editVehicle',
            vehicle: vehicle,
            onConfirm: async () => {
                const brand = document.getElementById('edit_brand')?.value;
                const model = document.getElementById('edit_model')?.value;
                const year = document.getElementById('edit_year')?.value;
                const price = document.getElementById('edit_price')?.value;
                const mileage = document.getElementById('edit_mileage')?.value;
                const fuel = document.getElementById('edit_fuel')?.value;
                const color = document.getElementById('edit_color')?.value;
                const info = document.getElementById('edit_info')?.value;

                const token = localStorage.getItem('carbike_admin_token');
                try {
                    await fetch(`${API_URL}/admin/vehicles/${vehicle.id}`, {
                        method: 'PUT',
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ brand, model, year, price, mileage, fuel, color, info })
                    });
                    fetchData();
                    closeModal();
                } catch (e) { console.error(e); }
            }
        });
    };

    const handlePauseVehicle = async (vehicle) => {
        setModalConfig({
            isOpen: true,
            title: 'Pausar Anúncio',
            message: `Desativar temporariamente o anúncio do ${vehicle.brand} ${vehicle.model}? Ele sairá da vitrine, mas continuará salvo no sistema.`,
            confirmText: 'Pausar Anúncio',
            cancelText: 'Pular',
            type: 'warning',
            onConfirm: async () => {
                const token = localStorage.getItem('carbike_admin_token');
                try {
                    await fetch(`${API_URL}/admin/vehicles/${vehicle.id}/pause`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchData();
                    closeModal();
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleUnpauseVehicle = async (vehicle) => {
        setModalConfig({
            isOpen: true,
            title: 'Reativar Anúncio',
            message: `O ${vehicle.brand} ${vehicle.model} voltará imediatamente para a vitrine do site e buscas. Continuar?`,
            confirmText: 'Sim, Reativar Anúncio',
            cancelText: 'Pular',
            type: 'success',
            onConfirm: async () => {
                const token = localStorage.getItem('carbike_admin_token');
                try {
                    await fetch(`${API_URL}/admin/vehicles/${vehicle.id}/unpause`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchData();
                    closeModal();
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleDeleteVehicle = async (vehicle) => {
        setModalConfig({
            isOpen: true,
            title: 'Excluir Veículo Definitivamente',
            message: `Atenção: O ${vehicle.brand} ${vehicle.model} será deletado e suas imagens permanentemente apagadas. Isso não poderá ser desfeito.`,
            confirmText: 'Sim, excluir veículo',
            cancelText: 'Cancelar Ação',
            type: 'danger',
            onConfirm: async () => {
                const token = localStorage.getItem('carbike_admin_token');
                try {
                    await fetch(`${API_URL}/admin/vehicles/${vehicle.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchData();
                    closeModal();
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleHighlightVehicle = async (vehicle, hlValue) => {
        const token = localStorage.getItem('carbike_admin_token');
        try {
            await fetch(`${API_URL}/admin/vehicles/${vehicle.id}/highlight`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ highlight: hlValue })
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    const handleApproveUser = async (user) => {
        setModalConfig({
            isOpen: true,
            title: 'Confirmar Ativação',
            message: `Você está prestes a ativar a conta de ${user.name}. O parceiro poderá começar a anunciar imediatamente.`,
            confirmText: 'Ativar Agora',
            cancelText: 'Pular',
            type: 'success',
            onConfirm: async () => {
                const token = localStorage.getItem('carbike_admin_token');
                try {
                    await fetch(`${API_URL}/admin/users/${user.id}/approve`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchData();
                    closeModal();
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleApproveVehicle = async (vehicle) => {
        setModalConfig({
            isOpen: true,
            title: 'Aprovar Publicação',
            message: `O anúncio do ${vehicle.brand} ${vehicle.model} será publicado no site agora. Confirmar?`,
            confirmText: 'Publicar Anúncio',
            cancelText: 'Revisar depois',
            type: 'success',
            onConfirm: async () => {
                const token = localStorage.getItem('carbike_admin_token');
                try {
                    await fetch(`${API_URL}/admin/vehicles/${vehicle.id}/approve`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchData();
                    closeModal();
                } catch (e) { console.error(e); }
            }
        });
    };


    const getFilteredData = () => {
        let filtered = data;
        
        if (activeTab === 'users') {
            if (userFilter === 'lojas') filtered = filtered.filter(u => u.person_type === 'JURIDICA' && u.active === 1);
            if (userFilter === 'particulares') filtered = filtered.filter(u => u.person_type === 'FISICA' && u.active === 1);
            if (userFilter === 'all') filtered = filtered.filter(u => u.active === 1);
            if (userFilter === 'bloqueados') filtered = filtered.filter(u => u.active === 0);
        }
        
        if (activeTab === 'vehicles') {
            if (vehicleFilter === 'all') filtered = filtered.filter(v => v.active === 1);
            if (vehicleFilter === 'bloqueados') filtered = filtered.filter(v => v.active === 2);
        }

        if (!searchTerm) return filtered;
        const term = searchTerm.toLowerCase();

        if (activeTab === 'users') {
            return filtered.filter(u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term) || u.city?.toLowerCase().includes(term));
        }
        if (activeTab === 'vehicles') {
            return filtered.filter(v => v.model?.toLowerCase().includes(term) || v.brand?.toLowerCase().includes(term) || v.owner_name?.toLowerCase().includes(term));
        }
        return filtered;
    };

    const menuItems = [
        { id: 'summary', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
        { id: 'users', label: 'Lojas &\nParticulares', icon: <Store size={22} /> },
        { id: 'vehicles', label: 'Veículos Listados', icon: <Car size={22} /> },
        { id: 'requests', label: 'Aprovações', icon: <CheckCircle size={22} /> },
        { id: 'simulations', label: 'Simulações', icon: <Activity size={22} /> },
        { id: 'ads', label: 'Propagandas', icon: <Megaphone size={22} /> },
        { id: 'expired', label: 'Planos Vencidos', icon: <AlertTriangle size={22} /> },
        { id: 'admins', label: 'Configurações', icon: <Settings size={22} /> },
    ];

    return (
        <div className="flex h-screen bg-[#f4f7f9] font-sans">
            {/* Sidebar Superior & Conteúdo (Novo Formato) */}
            <div className={`bg-white border-r border-[#e5e7eb] transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col relative`}>
                
                {/* Logo Area */}
                <div className="py-8 flex items-center justify-center relative border-b border-transparent">
                    <img src="./img/logo.png" alt="Carbike" className={`${isSidebarOpen ? 'w-32' : 'w-12'} transition-all object-contain`} />
                    {isSidebarOpen && (
                        <button onClick={() => setIsSidebarOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-[#003A70] transition-colors p-1">
                            <Menu size={18} />
                        </button>
                    )}
                </div>

                {!isSidebarOpen && (
                    <div className="w-full flex justify-center mb-6 mt-2">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-[#003A70] transition-colors p-2 bg-gray-50 rounded-lg">
                            <Menu size={18} />
                        </button>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto mt-6 px-5 custom-scrollbar flex flex-col gap-3">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-5 px-6 py-[18px] rounded-3xl transition-all ${
                                activeTab === item.id
                                    ? 'bg-[#edf2f9] text-[#1a56db]'
                                    : 'bg-transparent text-[#64748b] hover:bg-gray-50 hover:text-gray-900'
                            } ${!isSidebarOpen && 'justify-center px-0'}`}
                        >
                            <span className={`${activeTab === item.id ? 'text-[#1a56db]' : 'text-[#64748b]'} flex-shrink-0 transition-colors`}>
                                {item.icon}
                            </span>
                            {isSidebarOpen && (
                                <span className={`text-[16px] text-left leading-tight whitespace-pre-line ${
                                    activeTab === item.id ? 'font-semibold text-[#1a56db]' : 'font-medium text-[#64748b]'
                                }`}>
                                    {item.label}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto px-3 pb-4">
                    <button 
                        onClick={handleLogout} 
                        className={`w-full flex items-center gap-4 px-4 py-3.5 text-[#64748b] hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all font-semibold ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                        <LogOut size={20} className="" />
                        {isSidebarOpen && <span className="text-[14.5px]">Encerrar Sessão</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className="bg-white h-[70px] border-b border-gray-200 flex justify-between items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-40" style={{ padding: '0 40px' }}>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {menuItems.find(m => m.id === activeTab)?.label}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 text-blue-700 text-xs font-bold tracking-wide" style={{ padding: '6px 16px' }}>
                            <Shield size={14} className="text-blue-500" />
                            ADMIN: {adminData?.region === 'Todas' ? 'GERAL' : adminData?.region?.toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Dynamic content scroll area */}
                <main className="flex-1 overflow-y-auto bg-transparent relative w-full h-full custom-scrollbar" style={{ padding: '40px' }}>
                    {loading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium text-sm animate-pulse">Carregando painel...</p>
                        </div>
                    ) : (
                        <div className="max-w-[1400px] mx-auto animate-fadeIn pb-12 w-full">

                            {/* === DASHBOARD SUMMARY === */}
                            {activeTab === 'summary' && stats && (
                                <div className="flex flex-col gap-6 w-full">
                                    
                                    {/* Header FleetAdmin Style */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                        <div>
                                            <span className="text-[#2563eb] text-[10px] font-bold tracking-widest uppercase mb-1 block">PAINEL DE CONTROLE</span>
                                            <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Estatísticas Gerais</h2>
                                            <p className="text-gray-500 text-sm mt-1">Visão em tempo real da sua frota e desempenho comercial.</p>
                                        </div>
                                        <div className="flex gap-3 mt-2 md:mt-0">
                                            <button className="bg-white border border-gray-200 text-gray-700 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-all text-xs" style={{ padding: '10px 20px' }}>
                                                <Calendar size={14} /> Últimos 30 dias
                                            </button>
                                            <button className="bg-[#2563eb] text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all shadow-blue-500/20 text-xs" style={{ padding: '10px 20px' }}>
                                                <Download size={14} /> Exportar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Top Cards - Vibrant & Spaced Style */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                        
                                        {/* Card 1: Estoque Total (Verde) */}
                                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-lg shadow-emerald-500/20 flex flex-col group hover:-translate-y-1 transition-transform relative overflow-hidden" style={{ padding: '32px' }}>
                                            <div className="absolute right-[-20px] top-[-10px] opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                                <Car size={130} className="text-white" />
                                            </div>
                                            <div className="flex justify-between items-center mb-6 relative z-10">
                                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                                                    <Car size={24} />
                                                </div>
                                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-sm">+12.5%</span>
                                            </div>
                                            <div className="mt-4 relative z-10">
                                                <p className="text-emerald-50 font-bold text-xs mb-2 uppercase tracking-widest pl-1">Estoque Total</p>
                                                <p className="text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md pl-1">{stats.totalCars}</p>
                                            </div>
                                        </div>

                                        {/* Card 2: Vendas Site (Laranja) */}
                                        <div className="bg-gradient-to-br from-orange-400 to-amber-600 rounded-3xl shadow-lg shadow-orange-500/20 flex flex-col group hover:-translate-y-1 transition-transform relative overflow-hidden" style={{ padding: '32px' }}>
                                            <div className="absolute right-[-20px] top-[-10px] opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                                <MessageSquare size={130} className="text-white" />
                                            </div>
                                            <div className="flex justify-between items-center mb-6 relative z-10">
                                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                                                    <MessageSquare size={24} />
                                                </div>
                                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-sm">+5.2%</span>
                                            </div>
                                            <div className="mt-4 relative z-10">
                                                <p className="text-orange-50 font-bold text-xs mb-2 uppercase tracking-widest pl-1">Vendas Pelo Site</p>
                                                <p className="text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md pl-1">{stats.vendas?.site || 0}</p>
                                            </div>
                                        </div>

                                        {/* Card 3: Total Geral de Saídas/Removidos (Azul) */}
                                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg shadow-blue-500/20 flex flex-col group hover:-translate-y-1 transition-transform relative overflow-hidden" style={{ padding: '32px' }}>
                                            <div className="absolute right-[-20px] top-[-10px] opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                                <Activity size={130} className="text-white" />
                                            </div>
                                            <div className="flex justify-between items-center mb-6 relative z-10">
                                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                                                    <TrendingUp size={24} />
                                                </div>
                                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-sm">ACUMULADO</span>
                                            </div>
                                            <div className="mt-4 relative z-10">
                                                <p className="text-blue-100 font-bold text-xs mb-2 uppercase tracking-widest pl-1">Saídas Totais</p>
                                                <p className="text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md pl-1">
                                                    {parseInt(stats.vendas?.site || 0) + parseInt(stats.vendas?.fora_site || 0) + parseInt(stats.vendas?.outros || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Detalhamento de Saídas */}
                                    <div className="bg-white rounded-[2rem] shadow-sm w-full border border-gray-100 mt-2" style={{ padding: '40px' }}>
                                        <div className="flex justify-between items-center mb-8 pb-4">
                                            <h3 className="text-[16px] font-bold text-[#0f172a]">Detalhamento de Saídas</h3>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></div><span className="text-[11px] font-bold text-gray-400">Plataforma</span></div>
                                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div><span className="text-[11px] font-bold text-gray-400">Manual</span></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Plataforma */}
                                            <div className="bg-[#f1f5f9] rounded-2xl flex flex-col border border-slate-200 shadow-sm relative group overflow-hidden" style={{ padding: '28px' }}>
                                                <div className="flex items-center gap-3 mb-4 pl-1">
                                                    <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
                                                        <Car size={18} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Via Plataforma</span>
                                                </div>
                                                
                                                <p className="text-5xl font-black text-[#0f172a] mb-6 tracking-tighter pl-1">{stats.vendas?.site || 0}</p>
                                                
                                                {/* Visual Bar */}
                                                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-auto mb-3">
                                                    <div className="bg-[#2563eb] h-full rounded-full transition-all duration-1000 ease-out" style={{width: '65%'}}></div>
                                                </div>
                                                <p className="text-xs font-medium text-gray-400 pl-1">65% do volume total</p>
                                            </div>

                                            {/* Sem auxílio */}
                                            <div className="bg-[#f1f5f9] rounded-2xl flex flex-col border border-slate-200 shadow-sm relative group overflow-hidden" style={{ padding: '28px' }}>
                                                <div className="flex items-center gap-3 mb-4 pl-1">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
                                                        <Activity size={18} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sem Auxílio</span>
                                                </div>
                                                
                                                <p className="text-5xl font-black text-[#0f172a] mb-6 tracking-tighter pl-1">{stats.vendas?.fora_site || 0}</p>
                                                
                                                {/* Visual Bar */}
                                                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-auto mb-3">
                                                    <div className="bg-gray-400 h-full rounded-full transition-all duration-1000 ease-out" style={{width: '25%'}}></div>
                                                </div>
                                                <p className="text-xs font-medium text-gray-400 pl-1">25% do volume total</p>
                                            </div>

                                            {/* Outros */}
                                            <div className="bg-[#f1f5f9] rounded-2xl flex flex-col border border-slate-200 shadow-sm relative group overflow-hidden" style={{ padding: '28px' }}>
                                                <div className="flex items-center gap-3 mb-4 pl-1">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
                                                        <MoreHorizontal size={18} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Outros</span>
                                                </div>
                                                
                                                <p className="text-5xl font-black text-[#0f172a] mb-6 tracking-tighter pl-1">{stats.vendas?.outros || 0}</p>
                                                
                                                {/* Visual Bar */}
                                                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-auto mb-3">
                                                    <div className="bg-gray-300 h-full rounded-full transition-all duration-1000 ease-out" style={{width: '10%'}}></div>
                                                </div>
                                                <p className="text-xs font-medium text-gray-400 pl-1">10% do volume total</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === LIST TABLES (USERS, VEHICLES, SIMULATIONS) === */}
                            {['users', 'vehicles', 'simulations', 'ads'].includes(activeTab) && (
                                <div className="space-y-6">
                                {activeTab === 'users' && (
                                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Lojas & Particulares</h2>
                                            <p className="text-gray-500 text-sm mt-1">Gerencie seus lojistas e parceiros particulares em um só lugar.</p>
                                        </div>
                                        <button onClick={fetchData} className="bg-[#1c64f2] text-white rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all text-sm" style={{ padding: '10px 20px' }}>
                                            <Activity size={16} /> Atualizar Lista
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'users' && (
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="relative w-full md:w-1/2 flex items-center bg-[#f8fafc] rounded-2xl" style={{ padding: '12px 16px' }}>
                                            <Search className="text-gray-400 mr-3" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Pesquisar por nome, cidade ou CNPJ..."
                                                className="w-full bg-transparent text-[15px] font-medium text-gray-700 focus:outline-none placeholder-gray-400"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                                            <button onClick={() => setUserFilter('all')} className={`whitespace-nowrap rounded-full text-[14px] font-bold transition-all ${userFilter === 'all' ? 'bg-[#1c64f2] text-white shadow-sm shadow-blue-500/20' : 'bg-[#f1f5f9] text-gray-600 hover:bg-gray-200'}`} style={{ padding: '10px 24px' }}>Todas</button>
                                            <button onClick={() => setUserFilter('lojas')} className={`whitespace-nowrap rounded-full text-[14px] font-bold transition-all ${userFilter === 'lojas' ? 'bg-[#1c64f2] text-white shadow-sm shadow-blue-500/20' : 'bg-[#f1f5f9] text-gray-600 hover:bg-gray-200'}`} style={{ padding: '10px 24px' }}>Lojas</button>
                                            <button onClick={() => setUserFilter('particulares')} className={`whitespace-nowrap rounded-full text-[14px] font-bold transition-all ${userFilter === 'particulares' ? 'bg-[#1c64f2] text-white shadow-sm shadow-blue-500/20' : 'bg-[#f1f5f9] text-gray-600 hover:bg-gray-200'}`} style={{ padding: '10px 24px' }}>Particulares</button>
                                            <button onClick={() => setUserFilter('bloqueados')} className={`whitespace-nowrap rounded-full text-[14px] font-bold transition-all ${userFilter === 'bloqueados' ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20' : 'bg-[#f1f5f9] text-gray-600 hover:bg-gray-200'}`} style={{ padding: '10px 24px' }}>Pausados</button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'vehicles' && (
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="relative w-full md:w-1/2 flex items-center bg-[#f8fafc] rounded-2xl" style={{ padding: '12px 16px' }}>
                                            <Search className="text-gray-400 mr-3" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Pesquisar por marca, modelo ou ano..."
                                                className="w-full bg-transparent text-[15px] font-medium text-gray-700 focus:outline-none placeholder-gray-400"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                                            <button onClick={() => setVehicleFilter('all')} className={`whitespace-nowrap rounded-full text-[14px] font-bold transition-all ${vehicleFilter === 'all' ? 'bg-[#1c64f2] text-white shadow-sm shadow-blue-500/20' : 'bg-[#f1f5f9] text-gray-600 hover:bg-gray-200'}`} style={{ padding: '10px 24px' }}>Ativos na Vitrine</button>
                                            <button onClick={() => setVehicleFilter('bloqueados')} className={`whitespace-nowrap rounded-full text-[14px] font-bold transition-all ${vehicleFilter === 'bloqueados' ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20' : 'bg-[#f1f5f9] text-gray-600 hover:bg-gray-200'}`} style={{ padding: '10px 24px' }}>Pausados</button>
                                        </div>
                                    </div>
                                )}

                                {!['users', 'vehicles'].includes(activeTab) && (
                                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                                        <div className="relative w-full max-w-md group">
                                            <input
                                                type="text"
                                                placeholder="Pesquisar..."
                                                className="w-full bg-white h-11 pl-11 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none shadow-sm transition-all text-sm font-medium"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-all" size={18} />
                                        </div>
                                        <button onClick={fetchData} className="bg-white px-5 py-2.5 rounded-xl shadow-sm text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center gap-2 font-semibold text-sm">
                                            <Activity size={16} /> Atualizar Lista
                                        </button>
                                    </div>
                                )}

                                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#f8fafc] border-b border-gray-200">
                                                    <tr>
                                                        {activeTab === 'users' && <>
                                                            <th className="font-bold text-gray-500 text-[11px] uppercase tracking-widest border-0" style={{ padding: '20px' }}>Parceiro</th>
                                                            <th className="font-bold text-gray-500 text-[11px] uppercase tracking-widest border-0" style={{ padding: '20px' }}>Cidade</th>
                                                            <th className="font-bold text-gray-500 text-[11px] uppercase tracking-widest border-0" style={{ padding: '20px' }}>Status Financeiro</th>
                                                            <th className="font-bold text-gray-500 text-[11px] uppercase tracking-widest border-0" style={{ padding: '20px' }}>Engajamento</th>
                                                            <th className="font-bold text-gray-500 text-[11px] uppercase tracking-widest text-right border-0" style={{ padding: '20px 24px 20px 20px' }}>Ações</th>
                                                        </>}
                                                        {activeTab === 'vehicles' && <>
                                                            <th className="font-bold text-gray-500 text-[11px] uppercase tracking-widest border-0" style={{ padding: '20px', paddingLeft: '20px' }}>Veículo</th>
                                                            <th className="font-bold text-gray-500 text-[11px] uppercase tracking-widest border-0" style={{ padding: '20px' }}>Lojista/Privado</th>
                                                            <th className="font-bold text-gray-500 text-[11px] uppercase tracking-widest border-0" style={{ padding: '20px' }}>Preço</th>
                                                            <th className="font-bold text-gray-500 text-[11px] uppercase tracking-widest border-0" style={{ padding: '20px' }}>Exposição</th>
                                                            <th className="font-bold text-gray-500 text-[11px] uppercase tracking-widest text-right border-0" style={{ padding: '20px 24px 20px 20px' }}>Ações</th>
                                                        </>}
                                                        {activeTab === 'simulations' && <>
                                                            <th className="p-4 font-semibold text-gray-600 text-[13px] uppercase tracking-wider">Data</th>
                                                            <th className="p-4 font-semibold text-gray-600 text-[13px] uppercase tracking-wider">Cliente</th>
                                                            <th className="p-4 font-semibold text-gray-600 text-[13px] uppercase tracking-wider">Loja / Veículo</th>
                                                            <th className="p-4 font-semibold text-gray-600 text-[13px] uppercase tracking-wider">Proposta</th>
                                                            <th className="p-4 font-semibold text-gray-600 text-[13px] uppercase tracking-wider">Contato</th>
                                                        </>}
                                                        {activeTab === 'ads' && <>
                                                            <th className="p-4 font-semibold text-gray-600 text-[13px] uppercase tracking-wider">Banner</th>
                                                            <th className="p-4 font-semibold text-gray-600 text-[13px] uppercase tracking-wider">Anunciante</th>
                                                            <th className="p-4 font-semibold text-gray-600 text-[13px] uppercase tracking-wider">Local</th>
                                                            <th className="p-4 font-semibold text-gray-600 text-[13px] uppercase tracking-wider">Performance</th>
                                                        </>}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {getFilteredData().length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="p-10 text-center text-gray-400 italic font-medium">Nenhum registro encontrado.</td>
                                                        </tr>
                                                    ) : getFilteredData().map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                                            {activeTab === 'users' && <>
                                                                <td className="pl-5" style={{ padding: '16px', paddingLeft: '20px' }}>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 min-w-12 min-h-12 rounded-full bg-[#eef4ff] flex items-center justify-center text-[#1c64f2] font-bold overflow-hidden">
                                                                            {item.file_path_user ? <img src={`${API_URL}/uploads/empresas/${item.file_path_user}`} className="w-full h-full object-cover" /> : item.name.substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-extrabold text-[#0f172a] text-[15px] truncate max-w-[180px]">{item.name}</span>
                                                                            <span className="text-[12px] text-gray-400 font-medium">{item.person_type === 'JURIDICA' ? 'Lojista' : 'Particular'}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="font-medium text-sm text-gray-500 capitalize" style={{ padding: '16px' }}>{item.city?.toLowerCase() || 'Não informada'}</td>
                                                                <td style={{ padding: '16px' }}>
                                                                    <div className={`rounded-full text-[11px] font-bold text-center w-fit ${item.paid ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'}`} style={{ padding: '6px 16px' }}>
                                                                        {item.paid ? 'Regularizado' : 'Pendente'}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '16px' }}>
                                                                    <div className="flex flex-col gap-1 w-[100px]">
                                                                        <span className="text-[13px] font-extrabold text-[#0f172a]">{item.view || 0} acessos</span>
                                                                        <div className="w-full bg-[#e2e8f0] h-[3px] rounded-full overflow-hidden mt-1">
                                                                            <div className="bg-[#1c64f2] h-full rounded-full" style={{width: '60%'}}></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="pr-5" style={{ padding: '16px', paddingRight: '20px' }}>
                                                                    <div className="flex gap-3 justify-end items-center">
                                                                        <button onClick={() => handleEditUser(item)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Edit size={16} /></button>
                                                                        {item.active === 1 ? (
                                                                            <button onClick={() => handlePauseUser(item)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Pausar"><Power size={16} /></button>
                                                                        ) : (
                                                                            <button onClick={() => handleUnpauseUser(item)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Ativar / Desbloquear"><Play size={16} /></button>
                                                                        )}
                                                                        <button onClick={() => handleDeleteUser(item)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                                    </div>
                                                                </td>
                                                            </>}

                                                            {activeTab === 'vehicles' && <>
                                                                <td className="pl-5" style={{ padding: '16px', paddingLeft: '20px' }}>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                                                                            <img src={`${API_URL}/uploads/veiculo/${encodeURIComponent((item.file_path || '').split(/[;,]/)[0].trim())}`} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-extrabold text-[#0f172a] text-[15px] truncate max-w-[200px]">{item.brand} {item.model}</span>
                                                                            <span className="text-[12px] text-gray-400 font-medium">{item.year} - {item.fuel || 'Não inf.'}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '16px' }}>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-[#1c64f2] text-sm hover:underline cursor-pointer truncate max-w-[150px]">{item.owner_name}</span>
                                                                        <span className="text-[11px] text-gray-400 font-medium capitalize">{item.owner_city?.toLowerCase() || 'Cidade não inf.'}</span>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '16px' }}>
                                                                    <div className="font-black text-[#0f172a] text-[15px]">
                                                                        R$ {parseFloat(item.price).toLocaleString('pt-BR')}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '16px' }}>
                                                                    <div className={`rounded-full flex items-center w-fit outline-none transition-colors border ${item.highlight ? 'bg-[#fff7ed] text-[#ea580c] border-[#ffedd5]' : 'bg-gray-100/50 text-gray-500 border-gray-200'}`} style={{ overflow: 'hidden' }}>
                                                                        <div className="pl-3 py-1 flex items-center justify-center">
                                                                            <Star size={12} fill={item.highlight ? "currentColor" : "none"} /> 
                                                                        </div>
                                                                        <select 
                                                                            value={item.highlight ? '1' : '0'} 
                                                                            onChange={(e) => handleHighlightVehicle(item, parseInt(e.target.value))}
                                                                            className="bg-transparent font-bold cursor-pointer text-[11px] uppercase tracking-widest outline-none pr-2 py-1.5 appearance-none" 
                                                                            style={{ paddingLeft: '8px' }}>
                                                                            <option value="0" className="text-gray-900 font-bold bg-white">Padrão</option>
                                                                            <option value="1" className="text-gray-900 font-bold bg-white"> Premium ✨</option>
                                                                        </select>
                                                                    </div>
                                                                </td>
                                                                <td className="pr-5" style={{ padding: '16px', paddingRight: '20px' }}>
                                                                    <div className="flex gap-3 justify-end items-center">
                                                                        <button onClick={() => handleEditVehicle(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Veículo"><Edit size={16} /></button>
                                                                        {item.active === 1 ? (
                                                                            <button onClick={() => handlePauseVehicle(item)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Esconder / Pausar Anúncio"><Power size={16} /></button>
                                                                        ) : (
                                                                            <button onClick={() => handleUnpauseVehicle(item)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Reativar e colocar na vitrine publicamente"><Play size={16} /></button>
                                                                        )}
                                                                        <button onClick={() => handleDeleteVehicle(item)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir"><Trash2 size={16} /></button>
                                                                    </div>
                                                                </td>
                                                            </>}

                                                            {activeTab === 'simulations' && <>
                                                                <td className="p-5 text-[11px] text-blue-900 font-black italic tracking-widest">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                                                                <td className="p-5">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-gray-800 text-sm">{item.user_name}</span>
                                                                        <span className="text-[10px] text-gray-400 font-bold tracking-widest">{item.cpf}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-5">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-blue-600 text-xs italic">{item.store_name}</span>
                                                                        <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">{item.car_name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-5">
                                                                    <div className="flex flex-col leading-tight">
                                                                        <div className="flex gap-2 items-end"><span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Parc:</span><span className="text-xs font-black text-emerald-600 italic">{item.qtd_installment}x R${parseFloat(item.installment_value).toLocaleString('pt-BR')}</span></div>
                                                                        <div className="flex gap-2 items-end"><span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Entr:</span><span className="text-xs font-black text-blue-900 italic">R${parseFloat(item.entry_value).toLocaleString('pt-BR')}</span></div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-5 font-bold text-xs text-gray-600 underline decoration-blue-200">{item.phone_number}</td>
                                                            </>}

                                                            {activeTab === 'ads' && <>
                                                                <td className="p-5">
                                                                    <div className="w-40 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                                                        {item.file_path ? (
                                                                            <img src={`${API_URL}/uploads/propagandas/${encodeURIComponent(item.file_path.trim())}`} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase">Sem Banner</div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="p-5">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-gray-800 text-sm truncate max-w-[200px]">{item.name}</span>
                                                                        <a href={item.link} target="_blank" className="text-[10px] text-blue-500 font-black truncate max-w-[200px] underline uppercase tracking-widest font-sans">Link Destino</a>
                                                                    </div>
                                                                </td>
                                                                <td className="p-5">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-bold text-gray-600">{item.city}</span>
                                                                        <span className="text-[10px] text-orange-600 font-black uppercase tracking-widest">{item.local}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-5">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Visualizações</span>
                                                                        <span className="text-lg font-black text-blue-900 leading-tight">{item.view || 0}</span>
                                                                    </div>
                                                                </td>
                                                            </>}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === LISTA DE APROVAÇÕES PENDENTES (PREMIUM) === */}
                            {activeTab === 'requests' && (
                                <div className="space-y-12 w-full animate-fadeIn max-w-[1200px] mx-auto pb-16">
                                    <div className="mb-8">
                                        <span className="text-[#2563eb] text-[10px] font-bold tracking-widest uppercase mb-1 block">FILA DE MODERAÇÃO</span>
                                        <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Solicitações Pendentes</h2>
                                        <p className="text-gray-500 text-sm mt-1">Revise e aprove novos parceiros e anúncios para manter a qualidade da plataforma.</p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                                        <section className="flex flex-col gap-5">
                                            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-2">
                                                <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                        <Users size={20} />
                                                    </div>
                                                    Parceiros a Validar
                                                </h3>
                                                <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                    {data.pendingUsers?.length || 0} pendentes
                                                </span>
                                            </div>

                                            {data.pendingUsers?.length === 0 ? (
                                                <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-12 flex flex-col items-center text-center group">
                                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4 group-hover:scale-110 transition-transform">
                                                        <CheckCircle size={32} />
                                                    </div>
                                                    <p className="text-[#0f172a] font-bold text-lg mb-1">Tudo em dia!</p>
                                                    <p className="text-gray-400 text-sm max-w-[200px]">Nenhuma loja ou particular aguardando aprovação no momento.</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-4">
                                                    {data.pendingUsers.map(u => (
                                                        <div key={u.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5 group hover:shadow-md transition-all border-l-4 border-l-blue-500">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                                        {u.name?.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-extrabold text-[#0f172a] text-[16px]">{u.name}</h4>
                                                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                                                                            <Mail size={12} /> {u.email}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.person_type === 'JURIDICA' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                    {u.person_type === 'JURIDICA' ? 'Lojista' : 'Particular'}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 bg-[#f8fafc] rounded-2xl p-4 border border-gray-50">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Localização</span>
                                                                    <div className="flex items-center gap-2 text-[#0f172a] font-bold text-sm">
                                                                        <MapPin size={14} className="text-blue-500" /> {u.city}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Documento</span>
                                                                    <div className="text-[#0f172a] font-bold text-sm">
                                                                        {u.document || 'Não inf.'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-3">
                                                                <button onClick={() => handleApproveUser(u)} className="flex-[2] py-3.5 bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-bold rounded-2xl text-[13px] shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                                                                    <CheckCircle size={18} /> Ativar Conta
                                                                </button>
                                                                <button onClick={() => handleDeleteUser(u)} className="flex-1 py-3.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 font-bold rounded-2xl text-[13px] transition-all flex items-center justify-center">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>

                                        <section className="flex flex-col gap-5">
                                            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-2">
                                                <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <Car size={20} />
                                                    </div>
                                                    Anúncios Pendentes
                                                </h3>
                                                <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                    {data.pendingCars?.length || 0} novos
                                                </span>
                                            </div>

                                            {data.pendingCars?.length === 0 ? (
                                                <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-12 flex flex-col items-center text-center group">
                                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4 group-hover:scale-110 transition-transform">
                                                        <Activity size={32} />
                                                    </div>
                                                    <p className="text-[#0f172a] font-bold text-lg mb-1">Vitrine Limpa!</p>
                                                    <p className="text-gray-400 text-sm max-w-[200px]">Nenhum novo veículo na fila de moderação.</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-4">
                                                    {data.pendingCars.map(c => (
                                                        <div key={c.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-emerald-500">
                                                            <div className="flex flex-col sm:flex-row gap-0">
                                                                <div className="w-full sm:w-44 h-40 bg-gray-100 relative overflow-hidden">
                                                                    <img src={`${API_URL}/uploads/veiculo/${encodeURIComponent((c.file_path || '').split(/[;,]/)[0].trim())}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                    <div className="absolute top-3 left-3 bg-[#0f172a]/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                                        R$ {parseFloat(c.price).toLocaleString('pt-BR')}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 p-6 flex flex-col justify-between">
                                                                    <div>
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <h4 className="font-extrabold text-[#0f172a] text-lg leading-tight">{c.brand} {c.model}</h4>
                                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{c.year}</span>
                                                                        </div>
                                                                        <p className="text-gray-400 text-xs font-medium mb-4 flex items-center gap-1.5">
                                                                            <Users size={12} className="text-emerald-500" /> Proposta de: <span className="text-[#0f172a] font-bold">{c.owner_name}</span>
                                                                        </p>
                                                                        <div className="flex gap-2">
                                                                            <button onClick={() => handleApproveVehicle(c)} className="flex-1 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-2xl text-[12px] shadow-sm shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                                                                <CheckCircle size={16} /> Ativar Anúncio
                                                                            </button>
                                                                            <button onClick={() => handleDeleteVehicle(c)} className="px-4 py-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 font-bold rounded-2xl text-[12px] transition-all">
                                                                                Recusar
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    </div>
                                </div>
                            )}

                            {/* === PLANOS VENCIDOS === */}
                            {activeTab === 'expired' && (
                                <div className="animate-fadeIn pb-16">
                                    <div className="mb-8">
                                        <span className="text-red-500 text-[10px] font-bold tracking-widest uppercase mb-1 block">ALERTA DE RECEITA</span>
                                        <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Assinaturas Vencidas</h2>
                                        <p className="text-gray-500 text-sm mt-1">Lojistas com planos expirados. Entre em contato para renovação.</p>
                                    </div>
                                    <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-20 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
                                            <AlertTriangle size={40} />
                                        </div>
                                        <h4 className="text-xl font-bold text-[#0f172a] mb-2">Monitoramento de Inadimplência</h4>
                                        <p className="text-gray-400 text-sm max-w-[350px]">Todos os seus lojistas estão com as mensalidades em dia no momento. Bom trabalho!</p>
                                    </div>
                                </div>
                            )}

                            {/* === SETTINGS / ADMINS === */}
                            {activeTab === 'admins' && (
                                <div className="animate-fadeIn pb-16">
                                    <div className="mb-8">
                                        <span className="text-[#2563eb] text-[10px] font-bold tracking-widest uppercase mb-1 block">CONFIGURAÇÕES GERAIS</span>
                                        <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Administradores do Sistema</h2>
                                        <p className="text-gray-500 text-sm mt-1">Gerencie permissões e níveis de acesso da sua equipe.</p>
                                    </div>
                                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
                                        <div className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 border border-gray-100 mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#2563eb]">
                                                <Shield size={32} />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-[#0f172a] text-lg">{adminData?.name}</h4>
                                                <p className="text-gray-500 text-sm font-medium italic">Nível de Acesso: {adminData?.role || 'Super Admin'}</p>
                                            </div>
                                            <button className="ml-auto bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm">
                                                Meus Dados
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                           <div className="p-8 rounded-[2rem] bg-blue-600 text-white flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all">
                                                <Settings size={80} className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:rotate-45 transition-transform duration-1000" />
                                                <h5 className="font-bold text-lg">Adicionar Moderador</h5>
                                                <p className="text-blue-100 text-sm">Crie novos usuários administradores para ajudar na moderação de anúncios e lojistas.</p>
                                                <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm w-fit mt-2">Configurar Agora</button>
                                           </div>
                                           <div className="p-8 rounded-[2rem] bg-[#0f172a] text-white flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all">
                                                <Activity size={80} className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                                                <h5 className="font-bold text-lg">Logs do Sistema</h5>
                                                <p className="text-gray-400 text-sm">Visualize o histórico de ações de todos os administradores na plataforma.</p>
                                                <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm w-fit mt-2 border border-white/20">Ver Histórico</button>
                                           </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}} />

            {/* MODAL SYSTEM */}
            {modalConfig && modalConfig.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn" style={{ padding: '16px' }}>
                    <div className="bg-white w-full overflow-hidden flex flex-col" style={{ maxWidth: '650px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh' }}>
                        <div style={{ padding: '32px 32px 24px 32px' }}>
                            <div className="flex items-center" style={{ gap: '16px', marginBottom: '24px' }}>
                                <div className={`flex items-center justify-center ${modalConfig.type === 'danger' ? 'bg-red-50 text-red-600' : modalConfig.type === 'warning' ? 'bg-orange-50 text-orange-600' : modalConfig.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`} style={{ width: '56px', height: '56px', borderRadius: '16px' }}>
                                    {modalConfig.type === 'danger' ? <AlertTriangle size={24} /> : modalConfig.type === 'warning' ? <Power size={24} /> : modalConfig.type === 'success' ? <Play size={24} /> : <Edit size={24} />}
                                </div>
                                <h3 className="font-extrabold text-[#0f172a] tracking-tight" style={{ fontSize: '24px', margin: 0 }}>{modalConfig.title}</h3>
                            </div>
                            
                            {modalConfig.type === 'edit' ? (
                                <div className="custom-scrollbar" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '8px' }}>
                                    <p className="text-gray-500" style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, paddingBottom: '8px' }}>{modalConfig.message}</p>
                                    
                                    <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Nome Fantasia / Particular</label>
                                            <input type="text" id="edit_name" defaultValue={modalConfig.user.name} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>E-mail de Acesso</label>
                                            <input type="email" id="edit_email" defaultValue={modalConfig.user.email} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                                        <div>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>WhatsApp Principal</label>
                                            <input type="text" id="edit_phone" defaultValue={modalConfig.user.phone_number} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Telefone (Opcional)</label>
                                            <input type="text" id="edit_phone2" defaultValue={modalConfig.user.phone_number2} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                                        <div style={{ gridColumn: 'span 1' }}>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>CEP</label>
                                            <input type="text" id="edit_cep" defaultValue={modalConfig.user.cep} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Cidade</label>
                                            <input type="text" id="edit_city" defaultValue={modalConfig.user.city} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                                        <div style={{ gridColumn: 'span 1' }}>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>UF/Estado</label>
                                            <input type="text" id="edit_state" defaultValue={modalConfig.user.state} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Bairro</label>
                                            <input type="text" id="edit_district" defaultValue={modalConfig.user.district} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4" style={{ gap: '16px' }}>
                                        <div style={{ gridColumn: 'span 3' }}>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Logradouro (Rua/Avenida)</label>
                                            <input type="text" id="edit_street" defaultValue={modalConfig.user.street} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                        <div style={{ gridColumn: 'span 1' }}>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Número</label>
                                            <input type="text" id="edit_number" defaultValue={modalConfig.user.number} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Complemento</label>
                                        <input type="text" id="edit_complement" defaultValue={modalConfig.user.complement} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                    </div>
                                </div>
                            ) : modalConfig.type === 'editVehicle' ? (
                                <div className="custom-scrollbar" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '12px' }}>
                                    
                                    <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                                        <div>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Marca</label>
                                            <input type="text" id="edit_brand" defaultValue={modalConfig.vehicle.brand} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Modelo</label>
                                            <input type="text" id="edit_model" defaultValue={modalConfig.vehicle.model} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                                        <div>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Ano</label>
                                            <input type="text" id="edit_year" defaultValue={modalConfig.vehicle.year} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Preço (R$)</label>
                                            <input type="number" step="0.01" id="edit_price" defaultValue={modalConfig.vehicle.price} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                                        <div>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Quilometragem</label>
                                            <input type="text" id="edit_mileage" defaultValue={modalConfig.vehicle.mileage} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Combustível</label>
                                            <input type="text" id="edit_fuel" defaultValue={modalConfig.vehicle.fuel} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Cor</label>
                                            <input type="text" id="edit_color" defaultValue={modalConfig.vehicle.color} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px' }} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-500 uppercase font-bold" style={{ fontSize: '12px', letterSpacing: '0.1em', marginBottom: '6px', marginLeft: '4px' }}>Informações Adicionais</label>
                                        <textarea id="edit_info" defaultValue={modalConfig.vehicle.info} rows={3} className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all custom-scrollbar" style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px', resize: 'vertical' }}></textarea>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ overflowY: 'auto', maxHeight: '50vh' }}>
                                    <p className="text-gray-500" style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '20px', paddingLeft: '4px' }}>{modalConfig.message}</p>
                                </div>
                            )}
                            
                            <div className="flex justify-end w-full border-t border-gray-100 mt-auto" style={{ gap: '12px', paddingTop: '24px', paddingBottom: '8px', paddingRight: '8px' }}>
                                <button onClick={closeModal} className="font-bold text-gray-500 hover:bg-gray-100 transition-colors bg-transparent border-0 cursor-pointer" style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                    {modalConfig.cancelText}
                                </button>
                                <button onClick={modalConfig.onConfirm} className={`font-bold text-white shadow-sm transition-all flex items-center justify-center border-0 cursor-pointer ${modalConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : modalConfig.type === 'warning' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : modalConfig.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' }`} style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '14px', gap: '8px', whiteSpace: 'nowrap', minWidth: 'fit-content' }}>
                                   {modalConfig.type === 'danger' ? <Trash2 size={16}/> : modalConfig.type === 'warning' ? <Power size={16}/> : modalConfig.type === 'success' ? <Play size={16}/> : <Edit size={16}/>} {modalConfig.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
