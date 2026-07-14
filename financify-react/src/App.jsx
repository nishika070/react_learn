import Navbar from "./components/Navbar"
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expense from "./pages/Expense";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return (
    <>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      
      <Route 
          path="/expense" 
          element={
                  <ProtectedRoute>
                          <Expense/>
                  </ProtectedRoute>
                }
      />
      <Route 
          path="/income" 
          element={
                  <ProtectedRoute>
                      <Income/>
                      </ProtectedRoute>
                }
      />
    </Routes>
    </>
      )
}

export default App