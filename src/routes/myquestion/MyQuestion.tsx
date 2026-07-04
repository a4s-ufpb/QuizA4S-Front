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
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { BsPlusCircleFill, BsPencilSquare, BsTrashFill } from "react-icons/bs";
import Pagination from "../../components/pagination/Pagination";
import SearchComponent from "../../components/searchComponent/SearchComponent";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import ConfirmBox from "../../components/confirmBox/ConfirmBox";
import UpdateBox from "../../components/updateBox/UpdateBox";
import NotFoundComponent from "../../components/notFound/NotFoundComponent";
import MyAlternative from "./MyAlternative";
import { DEFAULT_IMG } from "../../vite-env";
import { QuestionService } from "./../../service/QuestionService";
import { useNavigate } from "react-router-dom";
import { getStoredTheme } from "../../util/storage";
import type { Alternative, InformationData, Question } from "../../types";

const MyQuestion = () => {
  const questionService = new QuestionService();
  const navigate = useNavigate();
  const { id: themeId, name: themeName, imageUrl: themeUrl } = getStoredTheme();

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConfirmBox, setConfirmBox] = useState(false);
  const [isUpdateBox, setUpdateBox] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);
  const [callBack, setCallBack] = useState<object>({});
  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    icon: "exclamation",
    color: "red",
  });
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionId, setQuestionId] = useState(0);
  const [newQuestion, setNewQuestion] = useState<{
    title: string;
    imageUrl: string;
  }>({
    title: "",
    imageUrl: "",
  });
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [isShowAlternatives, setShowAlternatives] = useState(false);

  const inputs = [
    {
      label: "Novo título",
      type: "text",
      placeholder: "Digite o título da questão",
      value: newQuestion.title,
      maxLength: 1500,
      minLength: 4,
    },
    {
      label: "URL da Imagem",
      type: "text",
      placeholder: "Digite a url da imagem",
      value: newQuestion.imageUrl,
      maxLength: 255,
      minLength: 0,
    },
  ];

  function changeName(propsQuestionTitle: string) {
    setQuestionTitle(propsQuestionTitle);
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await questionService.findQuestionsByCreator(
        themeId,
        currentPage,
        questionTitle
      );
      setLoading(false);

      if (!response.success) {
        activeInformationBox(true, response.message);
        return;
      }
      setTotalPages(response.data.totalPages);
      setQuestions(response.data.content);
    }

    fetchData();
  }, [currentPage, callBack, questionTitle]);

  function changeValue(value: string, label: string) {
    switch (label) {
      case "Novo título":
        setNewQuestion({ ...newQuestion, title: value });
        return;
      case "URL da Imagem":
        setNewQuestion({ ...newQuestion, imageUrl: value });
        return;
      default:
        return "";
    }
  }

  function showConfirmBox(id: number, title: string, imageUrl: string) {
    setQuestionId(id);
    setNewQuestion({ title: title, imageUrl: imageUrl });
    setConfirmBox(true);
  }

  function showUpdateBox(id: number, title: string, imageUrl: string) {
    setQuestionId(id);
    setNewQuestion({ title: title, imageUrl: imageUrl });
    setUpdateBox(true);
  }

  async function removeQuestion() {
    setLoading(true);
    const response = await questionService.removeQuestion(questionId);
    setLoading(false);

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    activeInformationBox(false, "Questão removida com sucesso!");
    setCallBack({});
    setConfirmBox(false);
  }

  async function updateQuestion() {
    setLoading(true);
    const response = await questionService.updateQuestion(
      questionId,
      newQuestion
    );
    setLoading(false);
    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    activeInformationBox(false, "Questão atualizada com sucesso");
    setCallBack({});
    setUpdateBox(false);
  }

  function activeInformationBox(isFail: boolean, message: string) {
    if (isFail) {
      setInformationData((prevData) => ({
        ...prevData,
        text: message,
      }));
      setInformationBox(true);
    } else {
      setInformationData((prevData) => ({
        ...prevData,
        text: message,
        color: "green",
        icon: "check",
      }));
      setInformationBox(true);
    }
  }

  function showAlternatives(questionAlternatives: Alternative[] = []) {
    setAlternatives(questionAlternatives);
    setShowAlternatives(true);
  }

  function navigateForRegisterQuestions() {
    navigate(`/create/quiz/${themeId}/question`);
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
            sx={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
          <div>
            <Typography variant="h6" sx={{ mb: 0 }}>
              {themeName}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              Minhas questões
            </Typography>
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
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
            lg: "1fr 1fr 1fr 1fr",
          },
          gap: 3,
          mt: 3,
        }}
      >
        {questions &&
          questions.map((question) => (
            <Card
              key={question.id}
              elevation={2}
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardMedia
                component="img"
                image={
                  question.imageUrl == null || question.imageUrl === ""
                    ? DEFAULT_IMG
                    : question.imageUrl
                }
                alt="image-question"
                sx={{
                  height: "150px",
                  objectFit: "cover",
                }}
              />
              <CardContent
                sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
              >
                <Typography sx={{ flexGrow: 1 }}>{question.title}</Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => showAlternatives(question.alternatives)}
                  >
                    Alternativas
                  </Button>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() =>
                          showUpdateBox(
                            question.id,
                            question.title,
                            question.imageUrl
                          )
                        }
                      >
                        <BsPencilSquare />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          showConfirmBox(
                            question.id,
                            question.title,
                            question.imageUrl
                          )
                        }
                      >
                        <BsTrashFill />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
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

      {isShowAlternatives && (
        <MyAlternative
          alternatives={alternatives}
          setAlternatives={setAlternatives}
          setShowAlternatives={setShowAlternatives}
          setCallBack={setCallBack}
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
      {isUpdateBox && (
        <UpdateBox
          title="Atualizar Questão"
          inputs={inputs}
          onChange={changeValue}
          onClickSave={updateQuestion}
          onClickCancel={() => setUpdateBox(false)}
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
