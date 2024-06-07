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

export const URL_BASE = "https://quizapp.a4s.dev.br/api/v1";
export const DEFAULT_IMG = "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg";

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
