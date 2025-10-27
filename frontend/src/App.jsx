import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/home.jsx";
import Auth from "../pages/auth.jsx";
import Chatpage from "../pages/chatpage.jsx";
import OAuthCallback from "./OAuthcallback.jsx";
function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chatpage" element={<Chatpage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
