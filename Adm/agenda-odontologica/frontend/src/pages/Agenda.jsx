import { useState } from 'react'
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi'
import { format, addDays } from 'date-fns'
import { Plus, Clock, User, Phone, Trash2, Edit } from 'lucide-react'

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const { data: agendamentos, refetch } = useApi(`/agendamentos?data=${selectedDate}`, [selectedDate])
  const { data: pacientes } = useApi('/pacientes')
  const { data: procedimentos } = useApi('/procedimentos')

  const [form, setForm] = useState({
    paciente_id: '',
    procedimento_id: '',
    data_hora: '',
    observacoes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await apiPut(`/agendamentos/${editingId}`, form)
      } else {
        await apiPost('/agendamentos', form)
      }
      setShowModal(false)
      setEditingId(null)
      setForm({ paciente_id: '', procedimento_id: '', data_hora: '', observacoes: '' })
      refetch()
    } catch (error) {
      alert('Erro ao salvar agendamento')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Confirma cancelamento?')) {
      await apiDelete(`/agendamentos/${id}`)
      refetch()
    }
  }

  const handleEdit = (agendamento) => {
    setForm({
      paciente_id: agendamento.paciente_id,
      procedimento_id: agendamento.procedimento_id,
      data_hora: agendamento.data_hora,
      observacoes: agendamento.observacoes || ''
    })
    setEditingId(agendamento.id)
    setShowModal(true)
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      <div className="mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Agendamentos - {format(new Date(selectedDate), 'dd/MM/yyyy')}</h2>
        </div>
        
        <div className="divide-y">
          {agendamentos?.map((agendamento) => (
            <div key={agendamento.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium">
                  {format(new Date(agendamento.data_hora), 'HH:mm')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{agendamento.paciente_nome}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{agendamento.procedimento_nome} ({agendamento.duracao}min)</span>
                  </div>
                  {agendamento.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{agendamento.telefone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(agendamento.status)}`}>
                  {agendamento.status}
                </span>
                <button
                  onClick={() => handleEdit(agendamento)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(agendamento.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {!agendamentos?.length && (
            <div className="p-8 text-center text-gray-500">
              Nenhum agendamento para esta data
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar' : 'Novo'} Agendamento
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Paciente</label>
                <select
                  value={form.paciente_id}
                  onChange={(e) => setForm({...form, paciente_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Selecione...</option>
                  {pacientes?.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              
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
                    <option key={p.id} value={p.id}>{p.nome} ({p.duracao}min)</option>
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
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingId(null)
                    setForm({ paciente_id: '', procedimento_id: '', data_hora: '', observacoes: '' })
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
    </div>
  )
}