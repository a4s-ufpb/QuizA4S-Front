import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import type { InputField } from "../../types";

interface UpdateBoxProps {
  title: string;
  inputs: InputField[];
  onChange: (value: string, label: string) => void;
  onClickSave: () => void;
  onClickCancel: () => void;
}

const UpdateBox = ({
  title,
  inputs,
  onChange,
  onClickSave,
  onClickCancel,
}: UpdateBoxProps) => {
  return (
    <Dialog open={true} onClose={onClickCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {inputs &&
            inputs.map((input) => (
              <TextField
                key={input.label}
                label={input.label}
                type={input.type === "password" ? "password" : "text"}
                multiline={input.type !== "password"}
                rows={input.type === "password" ? undefined : 3}
                placeholder={input.placeholder}
                value={input.value}
                onChange={(e) => onChange(e.target.value, input.label)}
                slotProps={{
                  htmlInput: {
                    maxLength: input.maxLength,
                    minLength: input.minLength,
                  },
                }}
                fullWidth
              />
            ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="success" onClick={onClickSave}>
          Salvar
        </Button>
        <Button variant="contained" color="error" onClick={onClickCancel}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateBox;
