import { useState } from "react";
import {
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { BsDownload, BsFileEarmarkPdf, BsFileEarmarkExcel } from "react-icons/bs";
import type { ApiResult } from "../../types";

export type ExportFormat = "PDF" | "XLSX";

interface ExportButtonProps {
  onExport: (
    format: ExportFormat
  ) => Promise<ApiResult<{ blob: Blob; filename: string }>>;
  disabled?: boolean;
}

const ExportButton = ({ onExport, disabled }: ExportButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const open = Boolean(anchorEl);

  function handleOpen(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  async function handleSelect(format: ExportFormat) {
    handleClose();
    setLoading(true);

    const result = await onExport(format);

    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || "Não foi possível exportar os dados.");
      return;
    }

    const { blob, filename } = result.data;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        disabled={disabled || loading}
        onClick={handleOpen}
        startIcon={loading ? <CircularProgress size={16} /> : <BsDownload />}
      >
        Exportar
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleSelect("PDF")}>
          <ListItemIcon>
            <BsFileEarmarkPdf />
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelect("XLSX")}>
          <ListItemIcon>
            <BsFileEarmarkExcel />
          </ListItemIcon>
          <ListItemText>Excel</ListItemText>
        </MenuItem>
      </Menu>
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage("")}
      >
        <Alert severity="error" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportButton;
