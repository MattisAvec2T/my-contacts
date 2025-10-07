import "./assets/css/common.css"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/auth.context.jsx";
import Auth from "./pages/auth.page.jsx";
import Dashboard from "./pages/dashboard.page.jsx";
import PrivateRoutes from "./components/protected.routes.jsx";

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={ <Auth /> } />
              <Route element={ <PrivateRoutes /> }>
                <Route path="/" element={ <Dashboard /> } />
              </Route>
          </Routes>
        </BrowserRouter>
    </AuthProvider>
  )
}

export default App
