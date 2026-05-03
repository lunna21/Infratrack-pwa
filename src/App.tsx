import logoImg from './assets/logo.png'; 

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">
        Censo Mascotas PWA
      </h1>
      <img src={logoImg} alt="Logo" className="w-96 h-96 mt-4" />
    </div>
  )
}

export default App;