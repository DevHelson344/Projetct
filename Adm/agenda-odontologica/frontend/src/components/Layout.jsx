import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Users, BarChart3, Database, LogOut } from 'lucide-react'

export default function Layout({ children }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    { name: 'Pacientes', href: '/pacientes', icon: Users },
    { name: 'Banco de Dados', href: '/database', icon: Database },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">DentalSoft</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                        location.pathname === item.href
                          ? 'border-b-2 border-blue-500 text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
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
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  )
}