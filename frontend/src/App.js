import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EquipmentList from "./pages/EquipmentList";

import Navbar from "./components/Navbar";

// Scaffolds
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import Recommendations from "./pages/Recommendations";
import OperatorHiring from "./pages/OperatorHiring";
import ServiceMarketplace from "./pages/ServiceMarketplace";
import TransportBooking from "./pages/TransportBooking";
import Maintenance from "./pages/Maintenance";

import GroupBooking from "./pages/GroupBooking";
import Reviews from "./pages/Reviews";
import MapSearch from "./pages/MapSearch";
import Weather from "./pages/Weather";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import CompareEquipment from "./pages/CompareEquipment";
import UsageHistory from "./pages/UsageHistory";
import Favorites from "./pages/Favorites";
import SeasonalInsights from "./pages/SeasonalInsights";
import Disputes from "./pages/Disputes";

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/equipment" element={<EquipmentList />} />

          
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/operator-hiring" element={<OperatorHiring />} />
          <Route path="/service-marketplace" element={<ServiceMarketplace />} />
          <Route path="/transport" element={<TransportBooking />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/group-booking" element={<GroupBooking />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/map" element={<MapSearch />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/compare" element={<CompareEquipment />} />
          <Route path="/history" element={<UsageHistory />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/insights" element={<SeasonalInsights />} />
          <Route path="/disputes" element={<Disputes />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;