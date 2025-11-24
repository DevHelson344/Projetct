import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useApi, apiPost } from '../hooks/useApi'
import { Calendar, Clock, User, Plus, LogOut } from 'lucide-react'
import { format } from 'date-fns'

export default function PatientDashboard() {
  const { user, logout } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const { data: agendamentos, refetch } = useApi('/meus-agendamentos')
  const { data: procedimentos } = useApi('/procedimentos')

  const [form, setForm] = useState({
    procedimento_id: '',
    data_hora: '',
    observacoes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiPost('/agendamentos', {
        ...form,
        paciente_id: user.paciente_id
      })
      setShowModal(false)
      setForm({ procedimento_id: '', data_hora: '', observacoes: '' })
      refetch()
    } catch (error) {
      alert('Erro ao agendar')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800'
      case 'confirmado': return 'bg-green-100 text-green-800'
      case 'concluido': return 'bg-gray-100 text-gray-800'
      case 'faltou': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">DentalSoft</h1>
              <span className="ml-4 text-gray-600">Área do Paciente</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Olá, {user?.email}</span>
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="divide-y">
            {agendamentos?.map((agendamento) => (
              <div key={agendamento.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">
                        {format(new Date(agendamento.data_hora), 'dd/MM/yyyy')}
                      </span>
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-gray-600">
                        {format(new Date(agendamento.data_hora), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      {agendamento.procedimento_nome}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duração: {agendamento.duracao} minutos
                    </p>
                    {agendamento.observacoes && (
                      <p className="text-sm text-gray-600 mt-1">
                        Obs: {agendamento.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(agendamento.status)}`}>
                      {agendamento.status}
                    </span>
                    <p className="text-lg font-bold text-green-600 mt-2">
                      R$ {agendamento.valor?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {!agendamentos?.length && (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Você ainda não tem agendamentos</p>
                <p className="text-sm">Clique em "Novo Agendamento" para começar</p>
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Novo Agendamento</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Procedimento</label>
                  <select
                    value={form.procedimento_id}
                    onChange={(e) => setForm({...form, procedimento_id: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Selecione...</option>
                    {procedimentos?.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} - R$ {p.valor?.toFixed(2)} ({p.duracao}min)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Data e Hora</label>
                  <input
                    type="datetime-local"
                    value={form.data_hora}
                    onChange={(e) => setForm({...form, data_hora: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Observações</label>
                  <textarea
                    value={form.observacoes}
                    onChange={(e) => setForm({...form, observacoes: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Alguma observação especial..."
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Agendar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setForm({ procedimento_id: '', data_hora: '', observacoes: '' })
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}