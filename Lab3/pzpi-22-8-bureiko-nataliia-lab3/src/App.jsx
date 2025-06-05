import './App.css'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { AdminDashboard } from './pages/AdminDashboard'
import { ConsultantDashboard } from './pages/ConsultantDashboard'
import { CreateProduct } from './pages/CreateProduct'
import { EditProduct } from './pages/EditProduct'
import { Landing } from './pages/Landing'
import { Catalog } from './pages/Catalog'
import { useEffect } from 'react'
import axios from 'axios'
import { ProtectedRoute } from './components/ProtectedRoute'
import ClientsPage from './pages/ClientsInfo'
import StatisticsPage from './pages/Statistics'
import { CreateSurvey } from './pages/CreateSurvey'
import SurveyManagement from './pages/SurveyManagement'
import EditSurvey from './pages/EditSurvey'
import { LanguageProvider } from './context/LanguageContext'

function App() {

  useEffect(() => {
    let token = sessionStorage.getItem("Admin")
    if (token) {
      axios.defaults.headers.common["authorization"] = `Bearer ${token}`
    }
  })

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing/>}/>
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard/>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/createproduct" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateProduct/>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/editproduct/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditProduct/>
              </ProtectedRoute>
            }
          />
          
          {/* Survey Management Routes */}
          <Route 
            path="/surveys" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SurveyManagement/>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/surveys/create" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateSurvey/>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/surveys/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditSurvey/>
              </ProtectedRoute>
            }
          />

          {/* Consultant Routes */}
          <Route 
            path="/consultant-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['consultant']}>
                <ConsultantDashboard/>
              </ProtectedRoute>
            }
          />

          {/* Shared Routes */}
          <Route 
            path="/catalog" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'consultant']}>
                <Catalog/>
              </ProtectedRoute>
            }
          />
                    <Route 
            path="/clients" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'consultant']}>
                <ClientsPage/>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/statistics" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'consultant']}>
                <StatisticsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
