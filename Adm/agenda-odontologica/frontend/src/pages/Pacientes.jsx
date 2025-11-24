import { useState } from 'react'
import { useApi, apiPost } from '../hooks/useApi'
import { Plus, User, Phone, Mail, Search } from 'lucide-react'

export default function Pacientes() {
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: pacientes, refetch } = useApi('/pacientes')

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiPost('/pacientes', form)
      setShowModal(false)
      setForm({ nome: '', telefone: '', email: '' })
      refetch()
    } catch (error) {
      alert('Erro ao cadastrar paciente')
    }
  }

  const filteredPacientes = pacientes?.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefone?.includes(searchTerm) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Paciente
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pacientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Lista de Pacientes ({filteredPacientes?.length || 0})</h2>
        </div>
        
        <div className="divide-y">
          {filteredPacientes?.map((paciente) => (
            <div key={paciente.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{paciente.nome}</span>
                  </div>
                  
                  {paciente.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Phone className="w-4 h-4" />
                      <span>{paciente.telefone}</span>
                    </div>
                  )}
                  
                  {paciente.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{paciente.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-500">
                  ID: {paciente.id}
                </div>
              </div>
            </div>
          ))}
          
          {!filteredPacientes?.length && (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Novo Paciente</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({...form, nome: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => setForm({...form, telefone: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="paciente@email.com"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Cadastrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setForm({ nome: '', telefone: '', email: '' })
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