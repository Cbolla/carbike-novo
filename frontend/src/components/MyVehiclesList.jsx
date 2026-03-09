import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, RefreshCw } from 'lucide-react';

const MyVehiclesList = ({ onOpenAddModal }) => {
  const [myVehicles, setMyVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyVehicles = () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('carbike_token');
    fetch('/veiculos/meus', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.mensagem || 'Erro ao carregar veículos.');
        else setMyVehicles(data.veiculos || []);
      })
      .catch(() => setError('Não foi possível conectar ao servidor.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMyVehicles(); }, []);

  return (
    <div className="my-vehicles-wrapper mt-4 fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-[#001f44]">Meu Estoque</h2>
           <p className="text-sm text-gray-500 mt-1">Gerencie os anúncios da sua loja ou perfil particular.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMyVehicles}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-full font-bold shadow-sm transition-all sm:text-sm text-xs"
            title="Atualizar lista"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-[#1c9be9] hover:bg-[#157eba] text-white px-5 py-2.5 rounded-full font-bold shadow-md transition-all sm:text-sm text-xs"
          >
            <Plus size={18} />
            <span>Cadastrar Veículo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="py-4 px-6 font-semibold">Veículo</th>
                <th className="py-4 px-6 font-semibold">Preço</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400 font-bold">
                    Carregando seus veículos...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-red-500 font-bold">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && myVehicles.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {v.fotoUrl ? (
                           <img src={v.fotoUrl} alt={v.modelo} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem Foto</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#001f44]">{v.marca} {v.modelo}</p>
                        <p className="text-xs text-gray-500">{v.ano} • {v.km} km</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-[#1c9be9]">
                    R$ {Number(v.preco).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4 px-6">
                    {v.active === 1 ? (
                       <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full w-max border border-green-200">
                          <CheckCircle size={12} /> Publicado
                       </span>
                    ) : (
                       <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full w-max border border-orange-200">
                          <Clock size={12} /> Pendente
                       </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir Anúncio">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !error && myVehicles.length === 0 && (
                <tr>
                   <td colSpan="4" className="py-12 text-center text-gray-500">
                      Você ainda não possui nenhum veículo cadastrado. <br/> Clique em <b>'Cadastrar Veículo'</b> para iniciar.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyVehiclesList;

