import axios from "axios";

const token = localStorage.getItem("token");

export const apiAxios = axios.create({
    baseURL: "https://quizapp.a4s.dev.br/api/v1",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
})