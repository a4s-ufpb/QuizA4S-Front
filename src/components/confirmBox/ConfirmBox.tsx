import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { BsQuestionCircle } from "react-icons/bs";

interface ConfirmBoxProps {
  title: string;
  textBtn1: string;
  textBtn2: string;
  onClickBtn1: () => void;
  onClickBtn2: () => void;
}

const ConfirmBox = ({
  title,
  textBtn1,
  textBtn2,
  onClickBtn1,
  onClickBtn2,
}: ConfirmBoxProps) => {
  return (
    <Dialog open={true} onClose={onClickBtn2} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <BsQuestionCircle size="3rem" color="#0055cc" />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="success" onClick={onClickBtn1}>
          {textBtn1}
        </Button>
        <Button variant="contained" color="error" onClick={onClickBtn2}>
          {textBtn2}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmBox;
