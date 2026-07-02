import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { BsCheckCircleFill, BsExclamationCircleFill } from "react-icons/bs";

interface InformationBoxProps {
  text: string;
  closeBox: () => void;
  icon: string;
  color: string;
}

const ICONS_BY_NAME: Record<string, React.ComponentType<{ size?: string | number; color?: string }>> = {
  check: BsCheckCircleFill,
  exclamation: BsExclamationCircleFill,
};

const InformationBox = ({
  text,
  closeBox,
  icon,
  color,
}: InformationBoxProps) => {
  const Icon = ICONS_BY_NAME[icon] ?? BsExclamationCircleFill;

  return (
    <Dialog open={true} onClose={closeBox} fullWidth maxWidth="xs">
      <DialogContent sx={{ textAlign: "center" }}>
        <Icon size="3rem" color={color} />
        <Typography variant="h5" sx={{ mt: 2 }} style={{ color }}>
          {text}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={closeBox}
          style={{ backgroundColor: color, borderColor: color }}
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InformationBox;
