import Navbar from "./components/Navbar"
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expense from "./pages/Expense";

function App() {
  return (
    <>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/expense" element={<Expense/>}/>
      <Route path="/income" element={<Income/>}/>
    </Routes>
    </>
      )
}

export default App