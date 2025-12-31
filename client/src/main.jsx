import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './Home.jsx'
import Admin from './Admin.jsx'

function AppWrapper(){
  return (
    <BrowserRouter basename="/contacts">
      <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: '12px' }}>Home</Link>
      </div>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/admin" element={<Admin/>} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
)
