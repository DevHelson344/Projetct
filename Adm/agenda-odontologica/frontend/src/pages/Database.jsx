import { useApi } from '../hooks/useApi'
import { Database, Users, Calendar, User } from 'lucide-react'

export default function DatabaseView() {
  const { data: usuarios } = useApi('/usuarios')
  const { data: pacientes } = useApi('/pacientes')
  const { data: agendamentos } = useApi('/agendamentos')
  const { data: info } = useApi('/database-info')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Banco de Dados</h1>
      
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Usuários</p>
              <p className="text-2xl font-bold">{info?.usuarios || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <User className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Pacientes</p>
              <p className="text-2xl font-bold">{info?.pacientes || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Agendamentos</p>
              <p className="text-2xl font-bold">{info?.agendamentos || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usuários */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Usuários Cadastrados
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuarios?.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{usuario.id}</td>
                  <td className="px-4 py-3 text-sm">{usuario.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      usuario.tipo === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {usuario.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{usuario.paciente_nome || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      usuario.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pacientes */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Pacientes Cadastrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pacientes?.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{paciente.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{paciente.nome}</td>
                  <td className="px-4 py-3 text-sm">{paciente.telefone || '-'}</td>
                  <td className="px-4 py-3 text-sm">{paciente.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agendamentos Recentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Agendamentos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedimento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agendamentos?.slice(0, 10).map((agendamento) => (
                <tr key={agendamento.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{agendamento.id}</td>
                  <td className="px-4 py-3 text-sm">{agendamento.paciente_nome}</td>
                  <td className="px-4 py-3 text-sm">{agendamento.procedimento_nome}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(agendamento.data_hora).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      agendamento.status === 'agendado' ? 'bg-blue-100 text-blue-800' :
                      agendamento.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                      agendamento.status === 'concluido' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {agendamento.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}