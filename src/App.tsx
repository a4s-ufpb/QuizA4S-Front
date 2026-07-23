// Components
import Header from "./components/header/Header";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./components/footer/Footer";
import { useContext } from "react";
import { AuthenticationContext } from "./context/AuthenticationContext";
import Loading from "./components/loading/Loading";
import { useFooter } from "./hooks/useFooter";

// Css
import "./App.css";

function App() {
  const { isAuthenticated, loading } = useContext(AuthenticationContext);
  const showFooter = useFooter();
  const location = useLocation();
  const showHeader = !location.pathname.startsWith("/quiz/");

  return (
    <div className="app">
      {loading && <Loading />}
      {showHeader && <Header isAuth={isAuthenticated} />}
      <Outlet />
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
