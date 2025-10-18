import { useEffect } from "react"
import { Link } from "react-router-dom"
import Card from "./Card"
import { userApi } from "./pages/api"

function App() {
  const test = 'hehehe'
  const names = ["Fast", "Flexible", "Modern"]
  const fetchUsers = async () => {
    const response = await userApi.getAll()
    console.log(response.data)
  }
  useEffect(() => {
    fetchUsers()
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Tailwind CSS Demo
          </h1>
          <p className="text-lg text-gray-600">
            Ví dụ về các component được styling với Tailwind
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {names.map((name, index) => (
            <Card key={index} name={name} />
          ))}
        </div>

        {/* Button Group */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Buttons Demo</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
              Primary
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
              Success
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
              Danger
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
              Secondary
            </button>
            <button className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200">
              Outline
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Navigation</h2>
          <Link
            to="/test"
            className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Đi đến trang Test →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default App
