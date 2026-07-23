import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Breadcrumbs,
  Link,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { BsPlusCircleFill, BsPencilSquare, BsTrashFill, BsEyeFill } from "react-icons/bs";
import Pagination from "../../components/pagination/Pagination";
import SearchComponent from "../../components/searchComponent/SearchComponent";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import ConfirmBox from "../../components/confirmBox/ConfirmBox";
import NotFoundComponent from "../../components/notFound/NotFoundComponent";
import QuestionBoxComponent from "../../components/questionBoxComponent/QuestionBoxComponent";
import QuestionEditDialog from "./QuestionEditDialog";
import { DEFAULT_IMG } from "../../vite-env";
import {
  useQuestionsByCreatorQuery,
  useRemoveQuestionMutation,
} from "../../query/useQuestionQueries";
import { useNavigate } from "react-router-dom";
import { getStoredTheme } from "../../util/storage";
import { getOrderedQuestionImages } from "../../util/questionImages";
import type { InformationData, Question } from "../../types";

const MyQuestion = () => {
  const removeQuestionMutation = useRemoveQuestionMutation();
  const navigate = useNavigate();
  const { id: themeId, name: themeName, imageUrl: themeUrl } = getStoredTheme();

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isConfirmBox, setConfirmBox] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);
  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    icon: "exclamation",
    color: "red",
  });
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionId, setQuestionId] = useState(0);

  // Item 5: estado para o modal de visualização (olho)
  const [viewQuestion, setViewQuestion] = useState<Question | null>(null);
  // Item 5: estado para o dialog de edição completa
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);

  function changeName(propsQuestionTitle: string) {
    setQuestionTitle(propsQuestionTitle);
  }

  const questionsQuery = useQuestionsByCreatorQuery(themeId, currentPage, questionTitle);
  const loading = questionsQuery.isLoading;

  useEffect(() => {
    if (!questionsQuery.data) return;
    if (!questionsQuery.data.success) {
      activeInformationBox(true, questionsQuery.data.message);
      return;
    }
    setTotalPages(questionsQuery.data.data.totalPages);
    setQuestions(questionsQuery.data.data.content);
  }, [questionsQuery.data]);

  function showConfirmBox(id: number) {
    setQuestionId(id);
    setConfirmBox(true);
  }

  async function removeQuestion() {
    const response = await removeQuestionMutation.mutateAsync(questionId);
    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }
    activeInformationBox(false, "Questão removida com sucesso!");
    setConfirmBox(false);
  }

  function activeInformationBox(isFail: boolean, message: string) {
    if (isFail) {
      setInformationData((prev) => ({ ...prev, text: message, color: "red", icon: "exclamation" }));
    } else {
      setInformationData((prev) => ({ ...prev, text: message, color: "green", icon: "check" }));
    }
    setInformationBox(true);
  }

  function navigateForRegisterQuestions() {
    navigate(`/create/quiz/${themeId}/question`);
  }

  // Item 5: "Editar Questão" vindo do QuestionBoxComponent abre o QuestionEditDialog
  function handleEditFromView(question: Question) {
    setViewQuestion(null);
    setEditQuestion(question);
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, minHeight: "100vh" }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate("/profile")}
        >
          Perfil
        </Link>
        <Typography color="text.primary">Minhas Questões</Typography>
      </Breadcrumbs>

      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box
            component="img"
            src={themeUrl == null || themeUrl === "" ? DEFAULT_IMG : themeUrl}
            alt="image-theme"
            loading="lazy"
            sx={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "10px" }}
          />
          <div>
            <Typography variant="h6" sx={{ mb: 0 }}>{themeName}</Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>Minhas questões</Typography>
          </div>
        </CardContent>
      </Card>

      <SearchComponent
        placeholder="Digite o título de uma questão"
        setData={setQuestions}
        url={`/question/creator/theme/${themeId}?page=${currentPage}&title=`}
        setCurrentPage={setCurrentPage}
        setTotalPages={setTotalPages}
        onSearch={changeName}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
          gap: 3,
          mt: 3,
        }}
      >
        {questions &&
          questions.map((question) => {
            // Item 5: exibe a primeira imagem na ordem definida (URL ou upload)
            const firstImage = getOrderedQuestionImages(question)[0] || DEFAULT_IMG;
            return (
              <Card
                key={question.id}
                elevation={2}
                sx={{ height: "100%", display: "flex", flexDirection: "column" }}
              >
                <CardMedia
                  component="img"
                  image={firstImage}
                  alt="image-question"
                  sx={{ height: "150px", objectFit: "cover" }}
                />
                <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <Typography sx={{ flexGrow: 1 }}>{question.title}</Typography>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 2, gap: 1 }}>
                    {/* Item 5: botão olho abre modal de visualização */}
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => setViewQuestion(question)}
                      >
                        <BsEyeFill />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => setEditQuestion(question)}
                      >
                        <BsPencilSquare />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => showConfirmBox(question.id)}
                      >
                        <BsTrashFill />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
      </Box>

      {!loading && questions.length === 0 && (
        <NotFoundComponent title="Questão não encontrada" />
      )}

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      <Tooltip title="Cadastrar questão">
        <IconButton
          color="primary"
          sx={{
            position: "fixed",
            bottom: 0,
            right: 0,
            m: 4,
            width: "60px",
            height: "60px",
            bgcolor: "primary.main",
            color: "#fff",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          onClick={navigateForRegisterQuestions}
        >
          <BsPlusCircleFill size={24} />
        </IconButton>
      </Tooltip>

      {/* Item 5: modal de visualização (olho) */}
      {viewQuestion && (
        <QuestionBoxComponent
          setQuestionBox={(val) => { if (!val) setViewQuestion(null); }}
          question={viewQuestion}
          setQuestion={(q) => setViewQuestion(typeof q === "function" ? q(viewQuestion) : q)}
          onEditQuestion={handleEditFromView}
        />
      )}

      {/* Item 5: dialog de edição completa */}
      {editQuestion && (
        <QuestionEditDialog
          question={editQuestion}
          open={Boolean(editQuestion)}
          onClose={() => setEditQuestion(null)}
          onSaved={() => {
            setEditQuestion(null);
            questionsQuery.refetch();
          }}
        />
      )}

      {isConfirmBox && (
        <ConfirmBox
          title="Deseja remover esta questão?"
          textBtn1="Sim"
          textBtn2="Não"
          onClickBtn1={removeQuestion}
          onClickBtn2={() => setConfirmBox(false)}
        />
      )}
      {isInformationBox && (
        <InformationBox
          text={informationData.text}
          color={informationData.color}
          icon={informationData.icon}
          closeBox={() => setInformationBox(false)}
        />
      )}

      {loading && <Loading />}
    </Container>
  );
};

export default MyQuestion;
