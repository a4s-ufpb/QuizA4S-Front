// Components
import Header from "./components/header/Header";
import { Outlet} from "react-router-dom";
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

  return (
    <div className="app">
      {loading && <Loading />}
      <Header isAuth={isAuthenticated} />
      <Outlet />
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
