import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { BsPencilSquare } from "react-icons/bs";
import UpdateBox from "../../components/updateBox/UpdateBox";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import { useUpdateAlternativeMutation } from "../../query/useAlternativeQueries";
import type { Alternative, InformationData } from "../../types";

interface MyAlternativeProps {
  alternatives: Alternative[];
  setShowAlternatives: (value: boolean) => void;
  setAlternatives: Dispatch<SetStateAction<Alternative[]>>;
}

const MyAlternative = ({
  alternatives,
  setShowAlternatives,
  setAlternatives,
}: MyAlternativeProps) => {
  const updateAlternativeMutation = useUpdateAlternativeMutation();
  const alternativeList = ["A", "B", "C", "D", "E", "F"];
  const [newResponse, setResponse] = useState("");
  const [alternativeId, setAlternativeId] = useState(0);
  const loading = updateAlternativeMutation.isPending;
  const [isUpdateBox, setUpdateBox] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);
  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    icon: "exclamation",
    color: "red",
  });

  const inputs = [
    {
      label: "Nova resposta",
      type: "text",
      placeholder: "Digite sua resposta",
      value: newResponse,
      maxLength: 500,
      minLength: 1,
    },
  ];

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
    if (label === "Nova resposta") {
      setResponse(value);
    }
  }

  function showUpdateBox(text: string, id: number) {
    setResponse(text);
    setAlternativeId(id);
    setUpdateBox(true);
  }

  async function updateAlternative() {
    const response = await updateAlternativeMutation.mutateAsync({
      alternativeId,
      alternativeUpdate: { text: newResponse },
    });

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    setAlternatives((prevAlternatives) =>
      prevAlternatives.map((alt) =>
        alt.id === alternativeId ? { ...alt, text: response.data.text } : alt
      )
    );

    activeInformationBox(false, "Alternativa atualizada com sucesso!");
    setUpdateBox(false);
  }

  return (
    <Dialog
      open={true}
      onClose={() => setShowAlternatives(false)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Alternativas</DialogTitle>
      <DialogContent>
        <List>
          {alternatives &&
            alternatives.map((alt, index) => (
              <ListItem
                key={alt.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: alt.correct ? "rgba(46, 125, 50, 0.5)" : undefined,
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  {alternativeList[index]}
                </Typography>
                <Typography sx={{ flexGrow: 1 }}>{alt.text}</Typography>
                <IconButton
                  size="small"
                  onClick={() => showUpdateBox(alt.text, alt.id ?? 0)}
                >
                  <BsPencilSquare />
                </IconButton>
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={() => setShowAlternatives(false)}
        >
          Fechar
        </Button>
      </DialogActions>

      {isUpdateBox && (
        <UpdateBox
          title="Atualizar Alternativa"
          inputs={inputs}
          onChange={changeValue}
          onClickSave={updateAlternative}
          onClickCancel={() => setUpdateBox(false)}
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
    </Dialog>
  );
};

export default MyAlternative;
