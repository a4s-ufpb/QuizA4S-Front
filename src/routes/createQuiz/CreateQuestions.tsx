import { useState, type ChangeEvent, type FormEvent } from "react";
import { DEFAULT_IMG } from "../../vite-env";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import { QuestionService } from "../../service/QuestionService";
import { AlternativeService } from "./../../service/AlternativeService";
import SearchImage from "../../components/searchImageComponent/SearchImage";
import QuestionListComponent from "../../components/questionListComponent/QuestionListComponent";
import { getStoredTheme } from "../../util/storage";
import type { Alternative, InformationData } from "../../types";
import {
  ALL_IMAGE_SLOTS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_TOTAL_IMAGES_SIZE_BYTES,
  MAX_UPLOAD_IMAGES,
  getQuestionImageBySlot,
  type ImageSlotKey,
} from "../../util/questionImages";

import "./CreateQuestions.css";

type QuestionField = "title" | "imageUrl";
type AlternativeField = "text" | "correct";

const MIN_ALTERNATIVES = 4;
const MAX_ALTERNATIVES = 6;

const IMAGE_SLOT_LABELS: Record<ImageSlotKey, string> = {
  URL: "Imagem por link",
  IMAGE_1: "Upload 1",
  IMAGE_2: "Upload 2",
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

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

  const [question, setQuestion] = useState<{
    title: string;
    imageUrl: string;
    imageBase64One: string;
    imageBase64Two: string;
  }>({
    title: "",
    imageUrl: "",
    imageBase64One: "",
    imageBase64Two: "",
  });

  const [imagesOrder, setImagesOrder] = useState<ImageSlotKey[]>([
    ...ALL_IMAGE_SLOTS,
  ]);

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
    const presentSlots = imagesOrder.filter((slot) =>
      Boolean(getQuestionImageBySlot(question, slot))
    );

    const questionResponse = await questionService.insertQuestion(
      { ...question, imagesOrder: presentSlots.join(",") },
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
    setQuestion({
      title: "",
      imageUrl: "",
      imageBase64One: "",
      imageBase64Two: "",
    });
    setImagesOrder([...ALL_IMAGE_SLOTS]);

    setAlternatives((prevAlternatives) =>
      prevAlternatives
        .slice(0, MIN_ALTERNATIVES)
        .map(() => ({ text: "", correct: false }))
    );
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

  function addAlternative() {
    setAlternatives((prevAlternatives) => {
      if (prevAlternatives.length >= MAX_ALTERNATIVES) return prevAlternatives;
      return [...prevAlternatives, { text: "", correct: false }];
    });
  }

  const { name: themeName, imageUrl: themeUrl } = getStoredTheme();

  function getUrlOfImage(urlOfImage: string) {
    changeQuestion("imageUrl", urlOfImage);
    setSearchImage(false);
  }

  async function handleImagesUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_UPLOAD_IMAGES);
    e.target.value = "";

    if (files.length === 0) return;

    const oversizedFile = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversizedFile) {
      activeInformationBox(true, "Cada imagem deve ter no máximo 2MB");
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_IMAGES_SIZE_BYTES) {
      activeInformationBox(
        true,
        "O total das imagens enviadas deve ser de no máximo 4MB"
      );
      return;
    }

    const dataUrls = await Promise.all(files.map(readFileAsDataUrl));

    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      imageBase64One: dataUrls[0] ?? "",
      imageBase64Two: dataUrls[1] ?? "",
    }));
  }

  function removeImage(slot: ImageSlotKey) {
    if (slot === "URL") {
      changeQuestion("imageUrl", "");
      return;
    }

    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      [slot === "IMAGE_1" ? "imageBase64One" : "imageBase64Two"]: "",
    }));
  }

  function moveImage(slot: ImageSlotKey, direction: -1 | 1) {
    setImagesOrder((prevOrder) => {
      const present = prevOrder.filter((s) =>
        Boolean(getQuestionImageBySlot(question, s))
      );
      const currentIndex = present.indexOf(slot);
      const newIndex = currentIndex + direction;

      if (currentIndex === -1 || newIndex < 0 || newIndex >= present.length) {
        return prevOrder;
      }

      const reorderedPresent = [...present];
      [reorderedPresent[currentIndex], reorderedPresent[newIndex]] = [
        reorderedPresent[newIndex],
        reorderedPresent[currentIndex],
      ];

      const hiddenSlots = prevOrder.filter((s) => !present.includes(s));
      return [...reorderedPresent, ...hiddenSlots];
    });
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

  const presentImageSlots = imagesOrder.filter((slot) =>
    Boolean(getQuestionImageBySlot(question, slot))
  );

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
              maxLength={1500}
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

          <div className="container-question-image-actions">
            <button
              type="button"
              className="create-question-btn"
              onClick={() => setSearchImage(true)}
            >
              Pesquisar Imagem na WEB
            </button>

            <label className="create-question-btn upload-images-btn">
              Fazer upload de imagens (até 2)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                hidden
              />
            </label>
          </div>
          <p className="upload-images-hint">
            Cada imagem enviada pode ter no máximo 2MB (total de 4MB). Você
            pode combinar um link de imagem com até 2 uploads (3 imagens no
            total).
          </p>

          {presentImageSlots.length > 0 && (
            <div className="container-images-order">
              <span>Ordem das imagens na tela do quiz:</span>
              <div className="images-order-list">
                {presentImageSlots.map((slot, index) => (
                  <div key={slot} className="image-order-item">
                    <img
                      src={getQuestionImageBySlot(question, slot)}
                      alt={IMAGE_SLOT_LABELS[slot]}
                    />
                    <span className="image-order-label">
                      {index + 1}º - {IMAGE_SLOT_LABELS[slot]}
                    </span>
                    <div className="image-order-actions">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveImage(slot, -1)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={index === presentImageSlots.length - 1}
                        onClick={() => moveImage(slot, 1)}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        className="image-order-remove"
                        onClick={() => removeImage(slot)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                    maxLength={500}
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

        {alternatives.length < MAX_ALTERNATIVES && (
          <button
            type="button"
            className="create-question-btn add-alternative-btn"
            onClick={addAlternative}
          >
            Adicionar Alternativa
          </button>
        )}

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
