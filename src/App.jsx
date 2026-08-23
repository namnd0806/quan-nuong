import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Checklist from './pages/Checklist'
import Budget from './pages/Budget'
import MenuCost from './pages/MenuCost'
import Suppliers from './pages/Suppliers'
import Notes from './pages/Notes'
import Decisions from './pages/Decisions'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/menu-cost" element={<MenuCost />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/decisions" element={<Decisions />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
