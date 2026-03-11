import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import '../custom.css';

const API_URL = 'http://localhost:3000';

const LojaEstoque = () => {
    const { id } = useParams();
    const [loja, setLoja] = useState(null);
    const [veiculos, setVeiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLojaStock = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/lojas/${id}`);
                const data = await response.json();
                if (data.error) throw new Error(data.mensagem || 'Loja não encontrada');

                setLoja(data.loja);
                setVeiculos(data.veiculos);
            } catch (err) {
                console.error("Erro ao carregar estoque da loja:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLojaStock();
        window.scrollTo(0, 0);
    }, [id]);

    const mapVeiculo = (v) => {
        const rawPhotos = (v.file_path || '').split(/[;,]/);
        const cover = rawPhotos[0]?.trim() || 'carro_default.png';
        const finalFoto = cover !== 'carro_default.png' ? `${API_URL}/uploads/veiculo/${encodeURIComponent(cover)}` : '';

        // Logo da loja/vendedor
        const rawLogo = v.logoLoja ? v.logoLoja.split('/').pop() : null;
        const finalLogo = rawLogo && rawLogo !== 'user_default.png' ? `${API_URL}/uploads/empresas/${encodeURIComponent(rawLogo)}` : null;

        return {
            id: v.id,
            marca: v.marca,
            modelo: v.modelo,
            ano: v.ano,
            preco: Number(v.preco).toLocaleString('pt-BR'),
            km: v.km,
            local: v.cidade || 'Brasil',
            tipoAnuncio: v.tipoVendedor === 'JURIDICA' ? 'loja' : 'particular',
            imagem: finalFoto,
            logoLoja: finalLogo,
            idLoja: v.idLoja,
            used: v.used
        };
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c9be9] mb-4"></div>
            <p className="text-gray-500 font-bold">Carregando estoque da loja...</p>
        </div>
    );

    if (error || !loja) return (
        <div className="p-10 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Ops! 😕</h2>
            <p className="text-gray-600">{error || "Loja não encontrada."}</p>
            <Link to="/" className="inline-block mt-4 bg-[#001f44] text-white px-6 py-2 rounded-full font-bold">Voltar para Home</Link>
        </div>
    );

    return (
        <div className="main-wrapper bg-[#f3f4f6] min-h-screen pb-12">
            {/* Header da Loja */}
            <section className="bg-white border-b border-gray-100 shadow-sm relative overflow-hidden mb-10 pt-10 pb-16">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center relative z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white mb-6 flex items-center justify-center transform transition-all hover:scale-105">
                        {(() => {
                            const rawLogo = loja.logo ? loja.logo.split('/').pop() : null;
                            const finalLogoUrl = rawLogo && rawLogo !== 'user_default.png' ? `${API_URL}/uploads/empresas/${encodeURIComponent(rawLogo)}` : null;

                            return finalLogoUrl ? (
                                <img src={finalLogoUrl} alt={loja.nome} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-3xl">
                                    {loja.nome?.charAt(0)}
                                </div>
                            );
                        })()}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-[#001f44] mb-2">{loja.nome}</h1>
                    <div className="flex items-center text-gray-400 font-medium">
                        <MapPin size={18} className="mr-1" /> {loja.cidade}
                    </div>
                </div>

                {/* Elemento Decorativo */}
                <div className="absolute top-0 right-0 opacity-5 blur-3xl w-80 h-80 bg-[#1c9be9] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 opacity-5 blur-3xl w-60 h-60 bg-[#001f44] rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </section>

            {/* Listagem de Estoque */}
            <section className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#001f44]">Estoque Disponível</h2>
                        <p className="text-gray-400 mt-1">{veiculos.length} {veiculos.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}</p>
                    </div>

                    <div className="search-wrapper w-full md:w-[350px]">
                        <input type="text" className="input-search" placeholder="Buscar no estoque..." />
                        <Search className="search-icon" />
                    </div>
                </div>

                {veiculos.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm">
                        <p className="text-gray-400 font-bold text-lg">Esta loja ainda não possui veículos ativos no estoque.</p>
                        <Link to="/ofertas" className="inline-block mt-4 text-[#1c9be9] font-bold underline hover:no-underline">Ver outras ofertas</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {veiculos.map(v => (
                            <VehicleCard key={v.id} {...mapVeiculo(v)} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default LojaEstoque;
