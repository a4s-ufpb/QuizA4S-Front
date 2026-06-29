import { useContext, type ReactNode } from "react";
import { AuthenticationContext } from "../../context/AuthenticationContext";
import Login from "../../routes/user/Login";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useContext(AuthenticationContext);

  return <>{isAuthenticated ? children : <Login />}</>;
};

export default PrivateRoute;
