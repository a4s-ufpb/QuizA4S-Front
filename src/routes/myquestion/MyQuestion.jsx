import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { PlusCircleFill } from "react-bootstrap-icons";
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

const MyQuestion = () => {
  const questionService = new QuestionService();
  const navigate = useNavigate();
  const {
    id: themeId,
    name: themeName,
    imageUrl: themeUrl,
  } = JSON.parse(localStorage.getItem("theme"));

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConfirmBox, setConfirmBox] = useState(false);
  const [isUpdateBox, setUpdateBox] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);
  const [callBack, setCallBack] = useState({});
  const [informationData, setInformationData] = useState({
    text: "",
    icon: "exclamation",
    color: "red",
  });
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionId, setQuestionId] = useState(0);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    imageUrl: "",
  });
  const [alternatives, setAlternatives] = useState([]);
  const [isShowAlternatives, setShowAlternatives] = useState(false);

  const inputs = [
    {
      label: "Novo título",
      type: "text",
      placeholder: "Digite o título da questão",
      value: newQuestion.title,
      maxLength: 170,
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

  function changeName(propsQuestionTitle) {
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

  function changeValue(value, label) {
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

  function showConfirmBox(id, title, imageUrl) {
    setQuestionId(id);
    setNewQuestion({ title: title, imageUrl: imageUrl });
    setConfirmBox(true);
  }

  function showUpdateBox(id, title, imageUrl) {
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

  function activeInformationBox(isFail, message) {
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

  function showAlternatives(alternatives) {
    setAlternatives(alternatives);
    setShowAlternatives(true);
  }

  function navigateForRegisterQuestions() {
    navigate(`/create/quiz/${themeId}/question`);
  }

  return (
    <Container fluid className="py-4 min-vh-100">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex align-items-center gap-3">
              <img
                src={themeUrl == null || themeUrl === "" ? DEFAULT_IMG : themeUrl}
                alt="image-theme"
                loading="lazy"
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
              <div>
                <h5 className="mb-0">{themeName}</h5>
                <h2 className="mt-2">Minhas questões</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <SearchComponent
        placeholder="Digite o título de uma questão"
        setData={setQuestions}
        url={`/question/creator/theme/${themeId}?page=${currentPage}&title=`}
        setCurrentPage={setCurrentPage}
        setTotalPages={setTotalPages}
        onSearch={changeName}
      />

      <Row xs={1} sm={2} md={3} lg={4} className="g-4 mt-3">
        {questions &&
          questions.map((question) => (
            <Col key={question.id}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Img
                  variant="top"
                  src={
                    question.imageUrl == null || question.imageUrl === ""
                      ? DEFAULT_IMG
                      : question.imageUrl
                  }
                  alt="image-question"
                  style={{
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "10px 10px 0 0",
                  }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Text className="flex-grow-1">{question.title}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => showAlternatives(question.alternatives)}
                    >
                      Alternativas
                    </Button>
                    <div className="d-flex gap-2">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Editar</Tooltip>}
                      >
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() =>
                            showUpdateBox(
                              question.id,
                              question.title,
                              question.imageUrl
                            )
                          }
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Excluir</Tooltip>}
                      >
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            showConfirmBox(
                              question.id,
                              question.title,
                              question.imageUrl
                            )
                          }
                        >
                          <i className="bi bi-trash-fill"></i>
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
      </Row>

      {!loading && questions.length === 0 && (
        <NotFoundComponent title="Questão não encontrada" />
      )}

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>Cadastrar questão</Tooltip>}
      >
        <Button
          variant="primary"
          className="rounded-circle position-fixed bottom-0 end-0 m-4"
          style={{ width: "60px", height: "60px" }}
          onClick={navigateForRegisterQuestions}
        >
          <PlusCircleFill size={24} />
        </Button>
      </OverlayTrigger>

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