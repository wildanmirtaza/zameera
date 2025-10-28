import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UndanganPages from "./pages/undanganPages";
import DistributorPages from "./pages/distributorPages";
import DashboardAdmin from "./pages/dashboardAdmin";
import ScannerAdmin from "./pages/scanner";
import NotFound from "./pages/notFound";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Halaman Utama</div>} />
        <Route path="/:slug" element={<UndanganPages />} />
        <Route path="distributor/:slug" element={<DistributorPages />} />
        <Route path="/dashboard" element={<DashboardAdmin />} />
        <Route path="/scanner" element={<ScannerAdmin />} />
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
