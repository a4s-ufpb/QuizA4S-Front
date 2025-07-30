import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  genAI = new GoogleGenerativeAI('AIzaSyDG_hjlKWaPAN8ixAbdByRshX5Vqh9PJ2k');

  model = this.genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  async generateQuestion(themeName) {
    try {
      let prompt = `
          Gere para mim uma questão sobre o tema ${themeName}, nesse formato:
                { "title": "", "alternatives": [ { "text": "", "correct": false },
                { "text": "", "correct": true }, { "text": "", "correct": false },
                { "text": "", "correct": false } ] } Onde o title precisa ter entre 4 e 170 caracteres;
                O text de cada alternativa deve ter entre 1 e 100 caracteres;
                E quero que alterne o lugar da alternativa correta, podendo ser a primeira, ou segunda, ou terceira, ou última`;
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error("Erro ao gerar questão:", error);
      return { error: "Tente novamente mais tarde!" };
    }
  }
}
