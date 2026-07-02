import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorPage from "./routes/erroPage/ErrorPage";
import Home from "./routes/home/Home";
import Login from "./routes/user/Login";
import Register from "./routes/user/Register";
import ChooseTheme from "./routes/chooseTheme/ChooseTheme";
import Quiz from "./routes/quiz/Quiz";
import { AuthenticationProvider } from "./context/AuthenticationContext";
import CreateQuiz from "./routes/createQuiz/CreateQuiz";
import Profile from "./routes/profile/Profile";
import MyQuestion from "./routes/myquestion/MyQuestion";
import PrivateRoute from "./components/privateRoute/PrivateRoute";
import CreateQuestion from "./routes/createQuiz/CreateQuestions";
import SelectTheme from "./routes/createQuiz/SelectTheme";
import RankingPage from "./routes/rankingPage/RankingPage";
import Multiplayer from "./routes/multiplayer/Multiplayer";
import Room from "./routes/multiplayer/Room";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthenticationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/theme" element={<ChooseTheme />} />
              <Route path="/theme/quiz/:id" element={<Quiz />} />
              <Route path="/multiplayer" element={<Multiplayer />} />
              <Route path="/room/:code" element={<Room />} />
              <Route
                path="/create/quiz"
                element={
                  <PrivateRoute>
                    <CreateQuiz />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create/quiz/theme"
                element={
                  <PrivateRoute>
                    <SelectTheme />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create/quiz/:id/question"
                element={
                  <PrivateRoute>
                    <CreateQuestion />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/theme/:id/question"
                element={
                  <PrivateRoute>
                    <MyQuestion />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ranking"
                element={
                  <PrivateRoute>
                    <RankingPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<ErrorPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthenticationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
