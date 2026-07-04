import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import UpdateBox from "../../components/updateBox/UpdateBox";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import { AlternativeService } from "../../service/AlternativeService";
import { QuestionService } from "../../service/QuestionService";
import { BsPencilSquare } from "react-icons/bs";
import ConfirmBox from "../confirmBox/ConfirmBox";
import { DEFAULT_IMG } from "../../vite-env";
import type { InformationData, Question } from "../../types";
import QuestionImageGallery from "../questionImageGallery/QuestionImageGallery";
import { getOrderedQuestionImages } from "../../util/questionImages";

interface QuestionBoxComponentProps {
  setQuestionBox: Dispatch<SetStateAction<boolean>>;
  question: Question;
  setCallback: Dispatch<SetStateAction<object>>;
  setQuestion: Dispatch<SetStateAction<Question>>;
  onEditQuestion: (question: Question) => void;
}

function QuestionBoxComponent({
  setQuestionBox,
  question,
  setCallback,
  setQuestion,
  onEditQuestion,
}: QuestionBoxComponentProps) {
  const alternativeService = new AlternativeService();
  const questionService = new QuestionService();
  const alternativesList = ["A", "B", "C", "D", "E", "F"];

  const [newResponse, setResponse] = useState("");
  const [alternativeId, setAlternativeId] = useState(0);

  const [loading, setLoading] = useState(false);
  const [isUpdateAlternative, setUpdateBoxAlternative] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);
  const [isConfirmBox, setConfirmBox] = useState(false);

  const alternativeInputs = [
    {
      label: "Nova resposta:",
      type: "text",
      placeholder: "Digite sua resposta",
      value: newResponse,
      maxLength: 500,
      minLength: 1,
    },
  ];

  const [newQuestion, setNewQuestion] = useState({
    id: 0,
    title: "",
    imageUrl: "",
  });

  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    icon: "exclamation",
    color: "red",
  });

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

  function changeValue(value: string, label: string) {
    switch (label) {
      case "Nova resposta:":
        setResponse(value);
        break;
      default:
        return "";
    }
  }

  function showUpdateAlternativeBox(text: string, id: number) {
    setResponse(text);
    setAlternativeId(id);
    setUpdateBoxAlternative(true);
  }

  function showConfirmBox(id: number, title: string, imageUrl: string) {
    const question = { id, title, imageUrl };
    setNewQuestion(question);
    setConfirmBox(true);
  }

  async function updateAlternative() {
    setLoading(true);
    const response = await alternativeService.updateAlternative(alternativeId, {
      text: newResponse,
    });

    if (!response.success) {
      activeInformationBox(true, response.message);
      setLoading(false);
      return;
    }

    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      alternatives: (prevQuestion.alternatives || []).map((alt) =>
        alt.id === alternativeId ? { ...alt, text: response.data.text } : alt
      ),
    }));
    setCallback({});
    activeInformationBox(false, "Alternativa atualizada com sucesso!");
    setUpdateBoxAlternative(false);
    setLoading(false);
  }

  function editQuestion() {
    setQuestionBox(false);
    onEditQuestion(question);
  }

  async function removeQuestion() {
    setLoading(true);
    const response = await questionService.removeQuestion(newQuestion.id);
    setLoading(false);

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    setCallback({});
    activeInformationBox(false, "Questão removida com sucesso!");
    setConfirmBox(false);

    setTimeout(() => {
      setQuestionBox(false);
    }, 1000);
  }

  return (
    <Dialog
      open={true}
      onClose={() => setQuestionBox(false)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{question?.title}</DialogTitle>
      <DialogContent sx={{ background: "linear-gradient(160deg, #f5f5f5 0%, #e0e0e0 100%)" }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <QuestionImageGallery
            images={
              getOrderedQuestionImages(question).length > 0
                ? getOrderedQuestionImages(question)
                : [DEFAULT_IMG]
            }
            className="question-box-image"
          />
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {question.alternatives &&
            question.alternatives.map((alternative, index) => (
              <Card
                key={alternative.id}
                sx={{
                  bgcolor: alternative.correct
                    ? "rgba(46, 125, 50, 0.5)"
                    : undefined,
                }}
              >
                <CardContent
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Typography sx={{ fontWeight: "bold" }}>
                    {alternativesList[index]}
                  </Typography>
                  <Typography sx={{ flexGrow: 1 }}>
                    {alternative.text}
                  </Typography>
                  <IconButton
                    onClick={() =>
                      showUpdateAlternativeBox(
                        alternative.text,
                        alternative.id ?? 0
                      )
                    }
                  >
                    <BsPencilSquare />
                  </IconButton>
                </CardContent>
              </Card>
            ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={editQuestion}>
          Editar Questão
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() =>
            showConfirmBox(question.id, question.title, question.imageUrl)
          }
        >
          Remover Questão
        </Button>
      </DialogActions>

      {isUpdateAlternative && (
        <UpdateBox
          title="Atualizar Alternativa"
          inputs={alternativeInputs}
          onChange={changeValue}
          onClickSave={updateAlternative}
          onClickCancel={() => setUpdateBoxAlternative(false)}
        />
      )}

      {loading && <Loading />}

      {isInformationBox && (
        <InformationBox
          text={informationData.text}
          color={informationData.color}
          icon={informationData.icon}
          closeBox={() => setInformationBox(false)}
        />
      )}

      {isConfirmBox && (
        <ConfirmBox
          title="Deseja Remover essa Questão?"
          textBtn1="Sim"
          textBtn2="Não"
          onClickBtn1={removeQuestion}
          onClickBtn2={() => setConfirmBox(false)}
        />
      )}
    </Dialog>
  );
}

export default QuestionBoxComponent;
