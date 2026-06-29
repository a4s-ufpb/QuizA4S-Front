import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
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
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthenticationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/theme" element={<ChooseTheme />} />
            <Route path="/theme/quiz/:id" element={<Quiz />} />
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
  </React.StrictMode>
);
