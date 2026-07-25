import { Dialog, DialogTitle, DialogContent, DialogActions, Button, useMediaQuery, useTheme } from "@mui/material";
import type { Breakpoint } from "@mui/material";
import type { ReactNode } from "react";

interface ProfileFeatureModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: Breakpoint;
  titleAction?: ReactNode;
}

const ProfileFeatureModal = ({ title, open, onClose, children, maxWidth = "md", titleAction }: ProfileFeatureModalProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth} fullScreen={fullScreen}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <span>{title}</span>
        {titleAction}
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileFeatureModal;
