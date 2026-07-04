import {
  BsChevronLeft,
  BsChevronRight,
  BsCheckCircleFill,
} from "react-icons/bs";
import QuestionBoxComponent from "../questionBoxComponent/QuestionBoxComponent";
import { useState } from "react";
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
import { useAllQuestionsByThemeQuery } from "../../query/useQuestionQueries";
import Loading from "../loading/Loading";
import { getStoredTheme } from "../../util/storage";
import { getOrderedQuestionImages } from "../../util/questionImages";
import type { Question } from "../../types";

interface QuestionListComponentProps {
  onEditQuestion: (question: Question) => void;
}

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 40;

function QuestionListComponent({ onEditQuestion }: QuestionListComponentProps) {
  const [showQuestionBox, setQuestionBox] = useState(false);
  const [questionData, setQuestionData] = useState<Question>({} as Question);
  const [isOpen, setIsOpen] = useState(true);

  const idTheme = getStoredTheme().id;

  const questionsQuery = useAllQuestionsByThemeQuery(idTheme);
  const loading = questionsQuery.isLoading;
  const questions = questionsQuery.data?.success ? questionsQuery.data.data : [];

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
          onEditQuestion={onEditQuestion}
        />
      )}
    </Box>
  );
}

export default QuestionListComponent;
