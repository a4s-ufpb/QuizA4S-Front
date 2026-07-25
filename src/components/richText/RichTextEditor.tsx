import { useEffect, useRef } from "react";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import {
  BsTypeBold,
  BsTypeItalic,
  BsTypeUnderline,
  BsListUl,
  BsListOl,
  BsTypeStrikethrough,
} from "react-icons/bs";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minRows?: number;
  error?: boolean;
  helperText?: string;
}

/**
 * Editor de texto simples com toolbar: bold/itálico/sublinhado/tachado/listas.
 * Armazena HTML. Usa document.execCommand (aceitável para MVP; sem deps novas).
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  minRows = 3,
  error,
  helperText,
}: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value ?? "";
    }
  }, [value]);

  function cmd(command: string) {
    document.execCommand(command, false);
    if (ref.current) onChange(ref.current.innerHTML);
    ref.current?.focus();
  }

  function handleInput() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  const minHeight = minRows * 24 + 16;

  return (
    <Box>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderBottom: "none",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          bgcolor: "action.hover",
          p: 0.5,
        }}
      >
        <Tooltip title="Negrito">
          <IconButton size="small" onClick={() => cmd("bold")}>
            <BsTypeBold />
          </IconButton>
        </Tooltip>
        <Tooltip title="Itálico">
          <IconButton size="small" onClick={() => cmd("italic")}>
            <BsTypeItalic />
          </IconButton>
        </Tooltip>
        <Tooltip title="Sublinhado">
          <IconButton size="small" onClick={() => cmd("underline")}>
            <BsTypeUnderline />
          </IconButton>
        </Tooltip>
        <Tooltip title="Tachado">
          <IconButton size="small" onClick={() => cmd("strikeThrough")}>
            <BsTypeStrikethrough />
          </IconButton>
        </Tooltip>
        <Tooltip title="Lista">
          <IconButton size="small" onClick={() => cmd("insertUnorderedList")}>
            <BsListUl />
          </IconButton>
        </Tooltip>
        <Tooltip title="Lista numerada">
          <IconButton size="small" onClick={() => cmd("insertOrderedList")}>
            <BsListOl />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        sx={{
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          p: 1.5,
          minHeight,
          outline: "none",
          "&:focus": { borderColor: "primary.main" },
          "&:empty:before": {
            content: "attr(data-placeholder)",
            color: "text.disabled",
          },
          "& ul, & ol": { pl: 3, my: 0 },
          "& p": { m: 0 },
        }}
      />
      {helperText && (
        <Box
          sx={{
            color: error ? "error.main" : "text.secondary",
            fontSize: 12,
            mt: 0.5,
            px: 1.5,
          }}
        >
          {helperText}
        </Box>
      )}
    </Box>
  );
};

export default RichTextEditor;
