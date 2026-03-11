import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3, Users, Car, CheckCircle, Megaphone,
    Shield, AlertTriangle, LogOut, Search, Trash2,
    Menu, X, Edit, Power, Star, Calendar, ArrowRight,
    TrendingUp, Activity, MessageSquare
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

    const getFilteredData = () => {
        if (!searchTerm) return data;
        const term = searchTerm.toLowerCase();
        if (activeTab === 'users') {
            return data.filter(u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
        }
        if (activeTab === 'vehicles') {
            return data.filter(v => v.model?.toLowerCase().includes(term) || v.brand?.toLowerCase().includes(term));
        }
        return data;
    };

    const menuItems = [
        { id: 'summary', label: 'Estatísticas', icon: <BarChart3 size={20} /> },
        { id: 'users', label: 'Lojas & Particulares', icon: <Users size={20} /> },
        { id: 'vehicles', label: 'Veículos Listados', icon: <Car size={20} /> },
        { id: 'requests', label: 'Aprovações', icon: <CheckCircle size={20} /> },
        { id: 'simulations', label: 'Simulações', icon: <Activity size={20} /> },
        { id: 'ads', label: 'Propagandas', icon: <Megaphone size={20} /> },
        { id: 'expired', label: 'Planos Vencidos', icon: <AlertTriangle size={20} /> },
        { id: 'admins', label: 'Administradores', icon: <Shield size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-[#F0F2F5] overflow-hidden font-sans">

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 bg-white shadow-2xl transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
                <div className="p-6 border-b flex items-center justify-between">
                    <img src="/img/logo.png" alt="Logo" className={`${isSidebarOpen ? 'w-32' : 'w-10'} transition-all`} />
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-blue-500 md:block hidden">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 mt-6 overflow-y-auto px-4 custom-scrollbar">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 p-3 mb-2 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            {item.icon}
                            {isSidebarOpen && <span className="font-semibold text-sm">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all underline">
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-bold underline">Sair do Painel</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} flex flex-col h-full`}>

                {/* Top Header */}
                <header className="bg-white p-4 px-8 shadow-sm flex justify-between items-center h-[70px]">
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider italic">
                        {menuItems.find(m => m.id === activeTab)?.label}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-2">
                            <Shield size={14} />
                            ADMIN: {adminData?.region === 'Todas' ? 'GERAL' : adminData?.region}
                        </div>
                    </div>
                </header>

                {/* Dynamic content scroll area */}
                <main className="flex-1 p-8 overflow-y-auto">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-blue-600 font-bold animate-pulse">Carregando painel...</p>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto animate-fadeIn">

                            {/* === DASHBOARD SUMMARY === */}
                            {activeTab === 'summary' && stats && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-blue-500 hover:scale-[1.02] transition-transform cursor-pointer">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Users /></div>
                                                <TrendingUp size={16} className="text-green-500" />
                                            </div>
                                            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-tighter">Parceiros Ativos</h3>
                                            <p className="text-4xl font-extrabold text-blue-900 mt-1">{stats.totalUsers}</p>
                                        </div>

                                        <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-emerald-500 hover:scale-[1.02] transition-transform cursor-pointer">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600"><Car /></div>
                                                <Activity size={16} className="text-emerald-500" />
                                            </div>
                                            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-tighter">Estoque Total</h3>
                                            <p className="text-4xl font-extrabold text-emerald-900 mt-1">{stats.totalCars}</p>
                                        </div>

                                        <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-orange-500 hover:scale-[1.02] transition-transform cursor-pointer">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><MessageSquare /></div>
                                                <span className="text-orange-500 text-[10px] font-bold">HISTÓRICO</span>
                                            </div>
                                            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-tighter">Vendas Site</h3>
                                            <p className="text-4xl font-extrabold text-orange-900 mt-1">{stats.vendas?.site}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
                                            <TrendingUp className="text-blue-600" /> Vendas e Conversões Geral
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                                            <div className="space-y-6">
                                                <div className="bg-[#f8fafc] p-4 rounded-2xl border-l-4 border-blue-500">
                                                    <p className="text-xs text-gray-500 font-bold uppercase">Vendido com auxílio Carbike</p>
                                                    <p className="text-2xl font-black text-blue-900">{stats.vendas?.site || 0}</p>
                                                </div>
                                                <div className="bg-[#f8fafc] p-4 rounded-2xl border-l-4 border-emerald-500">
                                                    <p className="text-xs text-gray-500 font-bold uppercase">Vendido sem auxílio</p>
                                                    <p className="text-2xl font-black text-emerald-900">{stats.vendas?.fora_site || 0}</p>
                                                </div>
                                                <div className="bg-[#f8fafc] p-4 rounded-2xl border-l-4 border-gray-400">
                                                    <p className="text-xs text-gray-500 font-bold uppercase">Outros motivos</p>
                                                    <p className="text-2xl font-black text-gray-700">{stats.vendas?.outros || 0}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[40px] text-white flex flex-col items-center text-center shadow-xl">
                                                <p className="text-sm font-bold opacity-80 mb-2 tracking-[3px]">RESULTADO</p>
                                                <p className="text-5xl font-black mb-4">TOTAL</p>
                                                <p className="text-6xl font-black text-blue-100 drop-shadow-lg">
                                                    {parseInt(stats.vendas?.site || 0) + parseInt(stats.vendas?.fora_site || 0) + parseInt(stats.vendas?.outros || 0)}
                                                </p>
                                                <p className="text-xs mt-6 opacity-60">Soma de todos os motivos de remoção de anúncios</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === LIST TABLES (USERS, VEHICLES, SIMULATIONS) === */}
                            {['users', 'vehicles', 'simulations', 'ads'].includes(activeTab) && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                        <div className="relative w-full max-w-md group">
                                            <input
                                                type="text"
                                                placeholder="Pesquisar..."
                                                className="w-full bg-white h-12 pl-12 pr-4 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:outline-none shadow-sm transition-all"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-all" size={20} />
                                        </div>
                                        <button onClick={fetchData} className="bg-white p-3 rounded-2xl shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 flex items-center gap-2 font-bold text-sm">
                                            <Activity size={18} /> Atualizar Lista
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#f8fafc] border-b border-gray-100">
                                                    <tr>
                                                        {activeTab === 'users' && <>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Ações</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Lojista/Particular</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Cidade</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Status Financeiro</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Cliques</th>
                                                        </>}
                                                        {activeTab === 'vehicles' && <>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Ações</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Veículo</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Proprietário</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Preço</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Destaque</th>
                                                        </>}
                                                        {activeTab === 'simulations' && <>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Data</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Cliente</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Loja / Veículo</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Valores</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Contato</th>
                                                        </>}
                                                        {activeTab === 'ads' && <>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Banner</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Anunciante</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Local/Cidade</th>
                                                            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Visualizações</th>
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
                                                                <td className="p-5">
                                                                    <div className="flex gap-2">
                                                                        <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={16} /></button>
                                                                        <button className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all"><Power size={16} /></button>
                                                                        <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                                                                    </div>
                                                                </td>
                                                                <td className="p-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden shadow-sm">
                                                                            {item.file_path_user ? <img src={`${API_URL}/uploads/empresas/${item.file_path_user}`} className="w-full h-full object-cover" /> : item.name[0]}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{item.name}</span>
                                                                            <span className="text-[11px] text-gray-400 font-medium">{item.email}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-5 font-bold text-xs text-gray-500 italic uppercase tracking-tighter">{item.city}</td>
                                                                <td className="p-5">
                                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border text-center w-fit ${item.paid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                                        {item.paid ? 'PAGO / ATUAL' : 'VENCIDO'}
                                                                    </div>
                                                                </td>
                                                                <td className="p-5">
                                                                    <div className="flex gap-4">
                                                                        <div className="flex flex-col items-center"><span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Perfis</span><span className="text-sm font-black text-blue-900">{item.view || 0}</span></div>
                                                                        <div className="flex flex-col items-center"><span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Whats</span><span className="text-sm font-black text-emerald-600">{item.whatsapp_click || 0}</span></div>
                                                                    </div>
                                                                </td>
                                                            </>}

                                                            {activeTab === 'vehicles' && <>
                                                                <td className="p-5 flex gap-2">
                                                                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={16} /></button>
                                                                    <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                                                                </td>
                                                                <td className="p-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={`${API_URL}/uploads/veiculo/${encodeURIComponent((item.file_path || '').split(/[;,]/)[0].trim())}`} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-white" />
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-gray-800 text-sm">{item.model}</span>
                                                                            <span className="text-[11px] text-gray-400 font-medium uppercase italic">{item.brand} | {item.year}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-5">
                                                                    <div className="flex flex-col items-start">
                                                                        <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 rounded-md">{item.owner_name}</span>
                                                                        <span className="text-[10px] text-gray-400 italic">{item.owner_city}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-5 font-black text-gray-800 text-sm italic tracking-tighter">R$ {parseFloat(item.price).toLocaleString('pt-BR')}</td>
                                                                <td className="p-5">
                                                                    <div className={`flex items-center gap-1 font-black italic text-[11px] uppercase tracking-[3px] ${item.highlight ? 'text-orange-500' : 'text-gray-300 opacity-30 underline'}`}>
                                                                        <Star size={14} fill={item.highlight ? "currentColor" : "none"} /> {item.highlight ? 'Premium' : 'Nomal'}
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

                            {/* === REQUESTS TAB (SPECIAL) === */}
                            {activeTab === 'requests' && (
                                <div className="space-y-12">
                                    <section>
                                        <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                                            <div className="w-1 bg-blue-600 h-8"></div> Novos Parceiros Aguardando
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {data.pendingUsers?.length === 0 ? <p className="text-gray-400 italic col-span-full">Nenhuma solicitação de usuário pendente.</p> :
                                                data.pendingUsers?.map(u => (
                                                    <div key={u.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                                            <Users size={60} className="text-blue-100" />
                                                        </div>
                                                        <h4 className="font-black text-lg text-blue-900 uppercase tracking-tighter mb-1 mt-2">{u.name}</h4>
                                                        <p className="text-xs text-gray-500 font-bold truncate mb-1">{u.email}</p>
                                                        <p className="text-[11px] text-blue-600 bg-blue-50 w-fit px-2 rounded-md font-bold mb-6 italic">{u.city} | {u.person_type}</p>

                                                        <div className="flex gap-3">
                                                            <button className="flex-1 h-12 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[3px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                                                <ArrowRight size={16} /> Liberar
                                                            </button>
                                                            <button className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                                            <div className="w-1 bg-emerald-600 h-8"></div> Veículos Pendentes de Revisão
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {data.pendingCars?.length === 0 ? <p className="text-gray-400 italic col-span-full">Nenhum veículo pendente.</p> :
                                                data.pendingCars?.map(c => (
                                                    <div key={c.id} className="bg-white p-5 rounded-[40px] shadow-sm border border-gray-100 flex gap-6 items-center hover:shadow-xl transition-all">
                                                        <img src={`${API_URL}/uploads/veiculo/${encodeURIComponent((c.file_path || '').split(/[;,]/)[0].trim())}`} className="w-32 h-32 rounded-[30px] object-cover shadow-inner" />
                                                        <div className="flex-1">
                                                            <p className="text-[10px] text-emerald-600 font-black tracking-widest uppercase mb-1">Solicitação Veículo</p>
                                                            <h4 className="font-black text-xl text-gray-800 uppercase italic tracking-tighter">{c.model}</h4>
                                                            <p className="text-xs text-gray-400 font-bold mb-4">{c.owner_name} • {c.owner_city}</p>
                                                            <div className="flex gap-3">
                                                                <button className="h-10 px-5 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all">Ativar Carro</button>
                                                                <button className="h-10 px-5 rounded-full bg-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Recusar</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </section>
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
        </div>
    );
};

export default AdminPanel;
