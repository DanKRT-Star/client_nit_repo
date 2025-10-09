function Card({ name }: {name: string}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>
    <p className="text-gray-600">Tốc độ phát triển nhanh với utility classes</p>
  </div>
  )
}

export default Card