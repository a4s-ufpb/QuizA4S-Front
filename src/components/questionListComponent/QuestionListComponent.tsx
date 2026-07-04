import {
  BsChevronLeft,
  BsChevronRight,
  BsCheckCircleFill,
} from "react-icons/bs";
import QuestionBoxComponent from "../questionBoxComponent/QuestionBoxComponent";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DEFAULT_IMG } from "../../vite-env";
import { QuestionService } from "../../service/QuestionService";
import InformationBox from "../informationBox/InformationBox";
import Loading from "../loading/Loading";
import { getStoredTheme } from "../../util/storage";
import { getOrderedQuestionImages } from "../../util/questionImages";
import type { InformationData, Question } from "../../types";

interface QuestionListComponentProps {
  callbackQuestions: object;
  onEditQuestion: (question: Question) => void;
}

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 40;

function QuestionListComponent({
  callbackQuestions,
  onEditQuestion,
}: QuestionListComponentProps) {
  const [showQuestionBox, setQuestionBox] = useState(false);
  const [questionData, setQuestionData] = useState<Question>({} as Question);
  const [isOpen, setIsOpen] = useState(true);

  const [questions, setQuestions] = useState<Question[]>([]);

  const idTheme = getStoredTheme().id;

  const [loading, setLoading] = useState(false);
  const [informationBox, setInformationBox] = useState(false);
  const [informationBoxData, setInformationBoxData] = useState<InformationData>(
    {
      text: "",
      color: "red",
      icon: "exclamation",
    }
  );

  const questionService = new QuestionService();

  const [callback, setCallback] = useState<object>({});

  useEffect(() => {
    fetchData();
  }, [callback, callbackQuestions]);

  async function fetchData() {
    try {
      setLoading(true);
      const questionResponse =
        await questionService.findAllQuestionsByTheme(idTheme);

      if (!questionResponse.success) {
        activeInformationBox(true, questionResponse.message);
        return;
      }

      setQuestions(questionResponse.data);
    } catch (error) {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
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

  function activeQuestionBox(question: Question) {
    setQuestionData(question);
    setQuestionBox(true);
  }

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100%",
        width: isOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        bgcolor: "background.paper",
        boxShadow: 3,
        zIndex: 2,
        transition: "width 0.25s ease-in-out",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          px: isOpen ? 1.5 : 0,
          py: 1,
        }}
      >
        {isOpen && (
          <Typography variant="subtitle1" noWrap>
            Questões
          </Typography>
        )}
        <Tooltip title={isOpen ? "Recolher" : "Expandir"}>
          <IconButton size="small" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <BsChevronLeft /> : <BsChevronRight />}
          </IconButton>
        </Tooltip>
      </Stack>

      {isOpen && (
        <Box sx={{ overflowY: "auto", px: 1, pb: 2, flexGrow: 1 }}>
          <Stack spacing={1.5}>
            {questions.map((question) => (
              <Card key={question.id} elevation={2}>
                <CardActionArea onClick={() => activeQuestionBox(question)}>
                  <CardMedia
                    component="img"
                    image={getOrderedQuestionImages(question)[0] || DEFAULT_IMG}
                    alt="imagem da questão"
                    sx={{ height: 90, objectFit: "cover" }}
                  />
                  <Box sx={{ p: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {question.title}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      {question.alternatives?.map((alternative) => (
                        <BsCheckCircleFill
                          key={alternative.id}
                          size={10}
                          color={alternative.correct ? "green" : "#ccc"}
                        />
                      ))}
                    </Stack>
                  </Box>
                </CardActionArea>
              </Card>
            ))}
          </Stack>

          {loading && <Loading />}
        </Box>
      )}

      {showQuestionBox && (
        <QuestionBoxComponent
          setQuestionBox={setQuestionBox}
          question={questionData}
          setQuestion={setQuestionData}
          setCallback={setCallback}
          onEditQuestion={onEditQuestion}
        />
      )}

      {informationBox && (
        <InformationBox
          closeBox={() => setInformationBox(false)}
          color={informationBoxData.color}
          text={informationBoxData.text}
          icon={informationBoxData.icon}
        />
      )}
    </Box>
  );
}

export default QuestionListComponent;
