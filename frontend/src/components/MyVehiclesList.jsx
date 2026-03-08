import React from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';

const MyVehiclesList = ({ onOpenAddModal }) => {
  // Dados Mockados Simulando o Retorno da Tabela do Lojista
  const myVehicles = [
    { id: 1, marca: 'Chevrolet', modelo: 'Onix 1.0 MT LT', ano: '2020/2020', preco: '62.500', status: 'ativo', img: '/img/21.png', visualizacoes: 142 },
    { id: 2, marca: 'Toyota', modelo: 'Corolla XEI 2.0', ano: '2022/2023', preco: '145.000', status: 'ativo', img: '/img/22.png', visualizacoes: 89 },
    { id: 3, marca: 'Honda', modelo: 'Civic LXR 2.0 Flex', ano: '2015/2016', preco: '75.900', status: 'pendente', img: '/img/20.png', visualizacoes: 12 },
  ];

  return (
    <div className="my-vehicles-wrapper mt-4 fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-[#001f44]">Meu Estoque</h2>
           <p className="text-sm text-gray-500 mt-1">Gerencie os anúncios da sua loja ou perfil particular.</p>
        </div>
        <button 
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-[#1c9be9] hover:bg-[#157eba] text-white px-5 py-2.5 rounded-full font-bold shadow-md transition-all sm:text-sm text-xs"
        >
          <Plus size={18} />
          <span>Cadastrar Veículo</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="py-4 px-6 font-semibold">Veículo</th>
                <th className="py-4 px-6 font-semibold">Preço</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-center">Cliques</th>
                <th className="py-4 px-6 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {myVehicles.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {v.img ? (
                           <img src={v.img} alt={v.modelo} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem Foto</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#001f44]">{v.marca} {v.modelo}</p>
                        <p className="text-xs text-gray-500">{v.ano}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-[#1c9be9]">
                    R$ {v.preco}
                  </td>
                  <td className="py-4 px-6">
                    {v.status === 'ativo' ? (
                       <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full w-max border border-green-200">
                          <CheckCircle size={12} /> Publicado
                       </span>
                    ) : (
                       <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full w-max border border-orange-200">
                          <Clock size={12} /> Pendente
                       </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center font-semibold text-gray-600">
                    {v.visualizacoes}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-[#1c9be9] hover:bg-blue-50 rounded-lg transition-colors" title="Editar Anúncio">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir Anúncio">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {myVehicles.length === 0 && (
                <tr>
                   <td colSpan="5" className="py-12 text-center text-gray-500">
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
