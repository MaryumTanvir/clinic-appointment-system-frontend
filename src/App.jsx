import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/admin/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Dashboard Route */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        
        {/* Other routes you will add later here */}
      </Routes>
    </Router>
  );
}

export default App;
