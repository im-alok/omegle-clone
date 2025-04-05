import { Route, Routes } from 'react-router-dom'
import Landing from "@/pages/Landing"
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className='min-h-screen min-w-screen  '>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
