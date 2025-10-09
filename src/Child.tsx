// props
function Child({ name, age }: { name: string, age: number }) {
  const handleClick = () => {
    console.log("click")
  }
  return (
    <div>
      <h1 className="text-red-300">Child {name} {age}</h1>
      <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => handleClick()}>
        Increment
      </button>
    </div>
  )
}

export default Child