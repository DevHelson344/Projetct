import { useApi } from '../hooks/useApi'
import { Calendar, DollarSign, UserX, Clock } from 'lucide-react'

export default function Dashboard() {
  const { data: dashboard, loading } = useApi('/dashboard')

  if (loading) return <div className="text-center py-8">Carregando...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Agendamentos Hoje</p>
              <p className="text-2xl font-bold">{dashboard?.agendamentos_hoje || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Faturamento Hoje</p>
              <p className="text-2xl font-bold">R$ {dashboard?.faturamento_hoje?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Faltas (30 dias)</p>
              <p className="text-2xl font-bold">{dashboard?.faltas_mes || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Visão do Consultório</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Tempo Médio</p>
            <p className="font-semibold">45 min</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-gray-600">Taxa Ocupação</p>
            <p className="font-semibold">85%</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded">
            <UserX className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
            <p className="text-sm text-gray-600">Taxa Faltas</p>
            <p className="font-semibold">12%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-gray-600">Ticket Médio</p>
            <p className="font-semibold">R$ 180</p>
          </div>
        </div>
      </div>
    </div>
  )
}