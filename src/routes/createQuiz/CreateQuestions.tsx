import { useState, type FormEvent } from "react";
import { DEFAULT_IMG } from "../../vite-env";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import { QuestionService } from "../../service/QuestionService";
import { AlternativeService } from "./../../service/AlternativeService";
import SearchImage from "../../components/searchImageComponent/SearchImage";
import QuestionListComponent from "../../components/questionListComponent/QuestionListComponent";
import { getStoredTheme } from "../../util/storage";
import type { Alternative, InformationData } from "../../types";

import "./CreateQuestions.css";

type QuestionField = "title" | "imageUrl";
type AlternativeField = "text" | "correct";

const CreateQuestions = () => {
  const questionService = new QuestionService();
  const alternativeService = new AlternativeService();

  const [loading, setLoading] = useState(false);
  const [informationBox, setInformationBox] = useState(false);

  const [showSearchImage, setSearchImage] = useState(false);

  const [informationBoxData, setInformationBoxData] = useState<InformationData>(
    {
      text: "",
      color: "red",
      icon: "exclamation",
    }
  );

  const idTheme = getStoredTheme().id;

  const [question, setQuestion] = useState<{ title: string; imageUrl: string }>(
    {
      title: "",
      imageUrl: "",
    }
  );

  const [alternatives, setAlternatives] = useState<Alternative[]>([
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
  ]);

  const [callbackQuestions, setCallbackQuestions] = useState<object>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    postQuestion();
  };

  async function postQuestion() {
    setLoading(true);
    const questionResponse = await questionService.insertQuestion(
      question,
      idTheme
    );
    setLoading(false);

    if (!questionResponse.success) {
      activeInformationBox(true, questionResponse.message);
      setLoading(false);
      return;
    }

    postAllAltervatives(questionResponse.data.id);
  }

  async function postAllAltervatives(idQuestion: number) {
    setLoading(true);
    const alternativeResponse = await alternativeService.insertAllAlternatives(
      idQuestion,
      alternatives
    );
    setLoading(false);

    if (!alternativeResponse.success) {
      activeInformationBox(true, alternativeResponse.message);
      removeQuestion(idQuestion);
      setLoading(false);
      return;
    }

    activeInformationBox(false, "Questão criada com sucesso!");
    setCallbackQuestions({}); // Atualiza a lista de alternativas em tempo real
    clearForm();
  }

  async function removeQuestion(idQuestion: number) {
    setLoading(true);
    const questionResponse = await questionService.removeQuestion(idQuestion);
    setLoading(false);

    if (!questionResponse.success) {
      activeInformationBox(true, questionResponse.message);
      setLoading(false);
    }
  }

  function clearForm() {
    setQuestion((prevQuestion) => {
      return { ...prevQuestion, title: "", imageUrl: "" };
    });

    for (let i = 0; i < alternatives.length; i++) {
      alternatives[i] = { text: "", correct: false };
    }
  }

  const changeQuestion = (field: QuestionField, data: string) => {
    setQuestion((prevQuestion) => ({ ...prevQuestion, [field]: data }));
  };

  const changeAlternative = (
    index: number,
    field: AlternativeField,
    data: string | boolean
  ) => {
    setAlternatives((prevAlternatives) => {
      const updatedAlternatives = [...prevAlternatives];
      updatedAlternatives[index] = {
        ...updatedAlternatives[index],
        [field]: data,
      };
      return updatedAlternatives;
    });
  };

  const { name: themeName, imageUrl: themeUrl } = getStoredTheme();

  function getUrlOfImage(urlOfImage: string) {
    changeQuestion("imageUrl", urlOfImage);
    setSearchImage(false);
  }

  function activeInformationBox(isFail: boolean, message: string) {
    if (isFail) {
      setInformationBoxData((prevData) => {
        return {
          ...prevData,
          text: message,
          color: "red",
          icon: "exclamation",
        };
      });
      setInformationBox(true);
    } else {
      setInformationBoxData((prevData) => {
        return { ...prevData, text: message, color: "green", icon: "check" };
      });
      setInformationBox(true);
    }
  }

  return (
    <div className="container-create-questions">
      <QuestionListComponent callbackQuestions={callbackQuestions} />

      <div className="container-create-questions-header">
        <div className="container-create-theme-info">
          <img
            src={themeUrl == null || themeUrl == "" ? DEFAULT_IMG : themeUrl}
            alt="image-theme"
            loading="lazy"
          />
          <span>{themeName}</span>
        </div>
        <div className="container-question-info">
          <p>Crie no mínimo 5 questões para o seu Quiz</p>
          <h2 className="create-questions-title">
            Crie as Questões do seu Quiz
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-questions-form" id="form">
        <div className="container-question">
          <label className="data-question">
            <span>Titulo:</span>
            <textarea
              name="title"
              placeholder="Insira o título da questão"
              value={question.title}
              onChange={(e) => changeQuestion("title", e.target.value)}
              maxLength={170}
              required
            ></textarea>
          </label>

          <label className="data-question">
            <span>URL:</span>
            <input
              type="text"
              name="imageUrl"
              placeholder="Pesquise a imagem na WEB ou insira a URL"
              value={question.imageUrl}
              onChange={(e) => changeQuestion("imageUrl", e.target.value)}
              maxLength={255}
            />
          </label>

          <button
            type="button"
            className="create-question-btn"
            onClick={() => setSearchImage(true)}
          >
            Pesquisar Imagem na WEB
          </button>
        </div>

        <div className="container-alternatives">
          {Array.isArray(alternatives) &&
            alternatives.map((alternative, index) => (
              <div key={index} className="alternative">
                <span>{`Alternativa ${index + 1}:`}</span>
                <label className="alternative-data">
                  <textarea
                    placeholder="Digite o texto da alternativa"
                    value={alternative.text}
                    onChange={(e) =>
                      changeAlternative(index, "text", e.target.value)
                    }
                    className="input-alternative-text"
                    maxLength={100}
                    required
                  ></textarea>
                  <input
                    type="radio"
                    name="alternative"
                    id={`alt-${index + 1}`}
                    checked={alternative.correct}
                    onChange={(e) =>
                      changeAlternative(index, "correct", e.target.checked)
                    }
                    className="input-alternative-check"
                    required
                  />
                </label>
              </div>
            ))}
        </div>

        <button type="submit" className="create-question-btn">
          Criar Questão
        </button>
      </form>

      {loading && <Loading />}
      {informationBox && (
        <InformationBox
          closeBox={() => setInformationBox(false)}
          color={informationBoxData.color}
          text={informationBoxData.text}
          icon={informationBoxData.icon}
        />
      )}
      {showSearchImage && (
        <SearchImage
          setSearchImage={setSearchImage}
          getUrlOfImage={getUrlOfImage}
        />
      )}
    </div>
  );
};

export default CreateQuestions;
