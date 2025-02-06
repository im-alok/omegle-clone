import { Route, Routes } from 'react-router-dom'
import Room from './components/Room'
import Landing from './components/Landing'


function App() {
  return(
    <div className='min-h-screen min-w-screen bg-green-800 border-2 border-white flex items-center justify-center'>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/room' element={<Room />} />

        

      </Routes>
    </div>
  )
}

export default App
