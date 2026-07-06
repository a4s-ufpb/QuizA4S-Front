import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import type { Breakpoint } from "@mui/material";
import type { ReactNode } from "react";

interface ProfileFeatureModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: Breakpoint;
}

const ProfileFeatureModal = ({ title, open, onClose, children, maxWidth = "md" }: ProfileFeatureModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileFeatureModal;
