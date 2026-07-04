import { useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  Modal,
  Radio,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  BsTrash,
  BsChevronUp,
  BsChevronDown,
  BsXLg,
  BsCloudUpload,
  BsEye,
} from "react-icons/bs";
import { DEFAULT_IMG } from "../../vite-env";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import {
  useInsertQuestionMutation,
  useRemoveQuestionMutation,
  useUpdateQuestionMutation,
} from "../../query/useQuestionQueries";
import {
  useInsertAllAlternativesMutation,
  useInsertAlternativeMutation,
  useRemoveAlternativeMutation,
  useUpdateAlternativeMutation,
} from "../../query/useAlternativeQueries";
import SearchImage from "../../components/searchImageComponent/SearchImage";
import QuestionListComponent from "../../components/questionListComponent/QuestionListComponent";
import { getStoredTheme } from "../../util/storage";
import type { Alternative, InformationData, Question } from "../../types";
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
const ALTERNATIVE_LABELS = ["A", "B", "C", "D", "E", "F"];

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

function isValidImageUrl(url: string): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const CreateQuestions = () => {
  const insertQuestionMutation = useInsertQuestionMutation();
  const updateQuestionMutation = useUpdateQuestionMutation();
  const removeQuestionMutation = useRemoveQuestionMutation();
  const insertAllAlternativesMutation = useInsertAllAlternativesMutation();
  const insertAlternativeMutation = useInsertAlternativeMutation();
  const updateAlternativeMutation = useUpdateAlternativeMutation();
  const removeAlternativeMutation = useRemoveAlternativeMutation();
  const navigate = useNavigate();

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

  const [uploadedFileNames, setUploadedFileNames] = useState<{
    IMAGE_1?: string;
    IMAGE_2?: string;
  }>({});

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [alternatives, setAlternatives] = useState<Alternative[]>([
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
  ]);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(
    null
  );
  const [originalAlternativeIds, setOriginalAlternativeIds] = useState<
    number[]
  >([]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidImageUrl(question.imageUrl)) {
      activeInformationBox(true, "Insira uma URL de imagem válida");
      return;
    }

    if (editingQuestion) {
      updateQuestionAndAlternatives();
    } else {
      postQuestion();
    }
  };

  async function postQuestion() {
    setLoading(true);
    const presentSlots = imagesOrder.filter((slot) =>
      Boolean(getQuestionImageBySlot(question, slot))
    );

    const questionResponse = await insertQuestionMutation.mutateAsync({
      question: { ...question, imagesOrder: presentSlots.join(",") },
      idTheme,
    });
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
    const alternativeResponse = await insertAllAlternativesMutation.mutateAsync({
      idQuestion,
      alternatives,
    });
    setLoading(false);

    if (!alternativeResponse.success) {
      activeInformationBox(true, alternativeResponse.message);
      removeQuestion(idQuestion);
      setLoading(false);
      return;
    }

    activeInformationBox(false, "Questão criada com sucesso!");
    clearForm();
  }

  async function updateQuestionAndAlternatives() {
    if (!editingQuestion) return;

    setLoading(true);
    const presentSlots = imagesOrder.filter((slot) =>
      Boolean(getQuestionImageBySlot(question, slot))
    );

    const questionResponse = await updateQuestionMutation.mutateAsync({
      questionId: editingQuestion.id,
      questionUpdate: { ...question, imagesOrder: presentSlots.join(",") },
    });

    if (!questionResponse.success) {
      activeInformationBox(true, questionResponse.message);
      setLoading(false);
      return;
    }

    const removedIds = originalAlternativeIds.filter(
      (id) => !alternatives.some((alt) => alt.id === id)
    );

    await Promise.all([
      ...alternatives.map((alt) =>
        alt.id
          ? updateAlternativeMutation.mutateAsync({
              alternativeId: alt.id,
              alternativeUpdate: { text: alt.text, correct: alt.correct },
            })
          : insertAlternativeMutation.mutateAsync({
              idQuestion: editingQuestion.id,
              alternative: alt,
            })
      ),
      ...removedIds.map((id) => removeAlternativeMutation.mutateAsync(id)),
    ]);

    setLoading(false);
    activeInformationBox(false, "Questão atualizada com sucesso!");
    clearForm();
  }

  async function removeQuestion(idQuestion: number) {
    setLoading(true);
    const questionResponse = await removeQuestionMutation.mutateAsync(idQuestion);
    setLoading(false);

    if (!questionResponse.success) {
      activeInformationBox(true, questionResponse.message);
      setLoading(false);
    }
  }

  function startEditingQuestion(questionToEdit: Question) {
    setEditingQuestion(questionToEdit);
    setQuestion({
      title: questionToEdit.title,
      imageUrl: questionToEdit.imageUrl ?? "",
      imageBase64One: questionToEdit.imageBase64One ?? "",
      imageBase64Two: questionToEdit.imageBase64Two ?? "",
    });

    const orderFromField = (questionToEdit.imagesOrder ?? "")
      .split(",")
      .map((slot) => slot.trim())
      .filter((slot): slot is ImageSlotKey =>
        ALL_IMAGE_SLOTS.includes(slot as ImageSlotKey)
      );
    const missingSlots = ALL_IMAGE_SLOTS.filter(
      (slot) => !orderFromField.includes(slot)
    );
    setImagesOrder([...orderFromField, ...missingSlots]);
    setUploadedFileNames({});

    const questionAlternatives = questionToEdit.alternatives ?? [];
    setAlternatives(
      questionAlternatives.length > 0
        ? questionAlternatives
        : [
            { text: "", correct: false },
            { text: "", correct: false },
            { text: "", correct: false },
            { text: "", correct: false },
          ]
    );
    setOriginalAlternativeIds(
      questionAlternatives
        .map((alt) => alt.id)
        .filter((id): id is number => id != null)
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function stopEditing() {
    setEditingQuestion(null);
    setOriginalAlternativeIds([]);
    clearForm();
  }

  function clearForm() {
    setQuestion({
      title: "",
      imageUrl: "",
      imageBase64One: "",
      imageBase64Two: "",
    });
    setImagesOrder([...ALL_IMAGE_SLOTS]);
    setUploadedFileNames({});

    setAlternatives([
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
    ]);
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

  function setCorrectAlternative(index: number) {
    setAlternatives((prevAlternatives) =>
      prevAlternatives.map((alt, i) => ({ ...alt, correct: i === index }))
    );
  }

  function addAlternative() {
    setAlternatives((prevAlternatives) => {
      if (prevAlternatives.length >= MAX_ALTERNATIVES) return prevAlternatives;
      return [...prevAlternatives, { text: "", correct: false }];
    });
  }

  function removeAlternative(index: number) {
    if (index < MIN_ALTERNATIVES) return;
    setAlternatives((prevAlternatives) =>
      prevAlternatives.filter((_, i) => i !== index)
    );
  }

  const { name: themeName, imageUrl: themeUrl } = getStoredTheme();

  function getUrlOfImage(urlOfImage: string) {
    changeQuestion("imageUrl", urlOfImage);
    setSearchImage(false);
  }

  async function processImageFiles(fileList: File[]) {
    const files = fileList.slice(0, MAX_UPLOAD_IMAGES);

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
    setUploadedFileNames({
      IMAGE_1: files[0]?.name,
      IMAGE_2: files[1]?.name,
    });
  }

  function handleImagesUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    processImageFiles(files);
  }

  function handleImagesDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files ?? []).filter((file) =>
      file.type.startsWith("image/")
    );
    processImageFiles(files);
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
    setUploadedFileNames((prev) => ({ ...prev, [slot]: undefined }));
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
      <QuestionListComponent onEditQuestion={startEditingQuestion} />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Breadcrumbs sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { color: "#fff" } }}>
          <MuiLink
            component="button"
            type="button"
            underline="hover"
            sx={{ color: "#fff" }}
            onClick={() => navigate(-1)}
          >
            Voltar
          </MuiLink>
          <Typography sx={{ color: "#fff" }}>
            Crie as Questões do seu Quiz
          </Typography>
        </Breadcrumbs>

        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
          <Avatar
            src={themeUrl == null || themeUrl === "" ? DEFAULT_IMG : themeUrl}
            alt="tema"
            variant="rounded"
            sx={{ width: 48, height: 48 }}
          />
          <Box>
            <Typography variant="h6" sx={{ color: "#fff", lineHeight: 1.2 }}>
              {themeName}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
              Crie no mínimo 5 questões para o seu quiz
            </Typography>
          </Box>
        </Stack>

        {editingQuestion && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button variant="contained" color="error" size="small" onClick={stopEditing}>
                Parar de editar
              </Button>
            }
          >
            Editando questão: {editingQuestion.title}
          </Alert>
        )}

        <Card
          component="form"
          id="create-question-form"
          onSubmit={handleSubmit}
          elevation={3}
        >
          <CardContent>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="Título da questão"
                  placeholder="Insira o título da questão"
                  value={question.title}
                  onChange={(e) => changeQuestion("title", e.target.value)}
                  multiline
                  minRows={2}
                  maxRows={8}
                  fullWidth
                  required
                  slotProps={{ htmlInput: { maxLength: 1500 } }}
                />

                <TextField
                  label="URL da imagem"
                  placeholder="Pesquise a imagem na WEB ou insira a URL"
                  value={question.imageUrl}
                  onChange={(e) => changeQuestion("imageUrl", e.target.value)}
                  fullWidth
                  error={!isValidImageUrl(question.imageUrl)}
                  helperText={
                    isValidImageUrl(question.imageUrl)
                      ? " "
                      : "Insira uma URL válida (ex: https://exemplo.com/imagem.png)"
                  }
                  slotProps={{ htmlInput: { maxLength: 255 } }}
                />

                <Button variant="outlined" onClick={() => setSearchImage(true)}>
                  Pesquisar imagem na web
                </Button>

                <Box
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={handleImagesDrop}
                  sx={{
                    border: "2px dashed",
                    borderColor: isDraggingOver ? "primary.main" : "divider",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                    bgcolor: isDraggingOver ? "action.hover" : "transparent",
                    transition: "background-color 0.15s ease, border-color 0.15s ease",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Arraste e solte imagens aqui ou faça upload
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<BsCloudUpload />}
                  >
                    Fazer upload de imagens (até 2)
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesUpload}
                      hidden
                    />
                  </Button>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Cada imagem enviada pode ter no máximo 2MB (total de 4MB). Você
                  pode combinar um link de imagem com até 2 uploads (3 imagens no
                  total).
                </Typography>

                {presentImageSlots.length > 0 && (
                  <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Ordem das imagens na tela do quiz
                    </Typography>
                    <Stack spacing={1}>
                      {presentImageSlots.map((slot, index) => {
                        const imageSrc = getQuestionImageBySlot(question, slot);
                        const label =
                          slot === "URL"
                            ? IMAGE_SLOT_LABELS[slot]
                            : uploadedFileNames[slot] ?? IMAGE_SLOT_LABELS[slot];
                        return (
                          <Stack
                            key={slot}
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: "center" }}
                          >
                            <Avatar
                              src={imageSrc}
                              variant="rounded"
                              sx={{ width: 48, height: 48 }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                flexGrow: 1,
                                minWidth: 0,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={label}
                            >
                              {index + 1}º - {label}
                            </Typography>
                            <IconButton
                              size="small"
                              disabled={index === 0}
                              onClick={() => moveImage(slot, -1)}
                            >
                              <BsChevronUp />
                            </IconButton>
                            <IconButton
                              size="small"
                              disabled={index === presentImageSlots.length - 1}
                              onClick={() => moveImage(slot, 1)}
                            >
                              <BsChevronDown />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => imageSrc && setPreviewImage(imageSrc)}
                              title="Visualizar imagem"
                            >
                              <BsEye />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeImage(slot)}
                            >
                              <BsXLg />
                            </IconButton>
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </Stack>

              <Box sx={{ display: { xs: "block", md: "flex" }, justifyContent: "center" }}>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, mr: 3 }} />
                <Stack spacing={1.5} sx={{ width: "100%" }}>
                  <Typography variant="subtitle1">Alternativas</Typography>

                  {alternatives.map((alternative, index) => (
                    <Stack key={index} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                      <Avatar sx={{ width: 32, height: 32, mt: 1, color: "#fff", bgcolor: "primary.main" }}>
                        {ALTERNATIVE_LABELS[index]}
                      </Avatar>
                      <TextField
                        placeholder="Digite o texto da alternativa"
                        value={alternative.text}
                        onChange={(e) =>
                          changeAlternative(index, "text", e.target.value)
                        }
                        multiline
                        minRows={1}
                        maxRows={6}
                        fullWidth
                        required
                        slotProps={{ htmlInput: { maxLength: 500 } }}
                      />
                      <Radio
                        checked={alternative.correct}
                        onChange={() => setCorrectAlternative(index)}
                        name="alternative"
                        required
                        title="Marcar como correta"
                        sx={{ mt: 0.5 }}
                      />
                      {index >= MIN_ALTERNATIVES && (
                        <IconButton
                          size="small"
                          color="error"
                          title="Remover alternativa"
                          onClick={() => removeAlternative(index)}
                          sx={{ mt: 0.5 }}
                        >
                          <BsTrash />
                        </IconButton>
                      )}
                    </Stack>
                  ))}

                  {alternatives.length < MAX_ALTERNATIVES && (
                    <Button variant="outlined" onClick={addAlternative}>
                      Adicionar Alternativa
                    </Button>
                  )}
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Button type="submit" form="create-question-form" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>
          {editingQuestion ? "Salvar Alterações" : "Criar Questão"}
        </Button>
      </Container>

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
      <Modal open={Boolean(previewImage)} onClose={() => setPreviewImage(null)}>
        <Box
          onClick={() => setPreviewImage(null)}
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
          }}
        >
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="Pré-visualização"
              onClick={(e) => e.stopPropagation()}
              sx={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default CreateQuestions;
