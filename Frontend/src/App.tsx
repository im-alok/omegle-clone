import { Route, Routes } from 'react-router-dom'
import Landing from "@/components/core/Landing"


function App() {
  return (
    <div className='min-h-screen min-w-screen bg-green-800 border-2 border-white flex items-center justify-center'>
      <Routes>
        <Route path='/' element={<Landing />} />
      </Routes>
    </div>
  )
}

export default App
