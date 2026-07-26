import type { Dispatch, SetStateAction } from "react";
import { Box, Button, FormControl, MenuItem, Select, Tooltip, Typography } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  BsChevronDoubleLeft,
  BsChevronLeft,
  BsChevronRight,
  BsChevronDoubleRight,
} from "react-icons/bs";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  color?: string;
  /** Quantidade de itens da página atual (mostrado à esquerda). */
  pageItemsCount?: number;
  /** Tamanho de página atual + setter — habilita o seletor à direita. */
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  /** Opções disponíveis no seletor (default 5/10/20/40). */
  pageSizeOptions?: number[];
}

const DEFAULT_SIZES = [5, 10, 20, 40];

const Pagination = ({
  totalPages,
  currentPage,
  setCurrentPage,
  color,
  pageItemsCount,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_SIZES,
}: PaginationProps) => {
  const isFirstPage = currentPage === 0;
  const isLastPage = totalPages === 0 || currentPage === totalPages - 1;

  const textColor = color || "white";
  const buttonSx = {
    color: textColor,
    borderColor: textColor,
    minWidth: { xs: 40, sm: 64 },
    px: { xs: 1, sm: 2 },
  };

  function goTo(page: number) {
    setCurrentPage(Math.max(0, Math.min(totalPages - 1, page)));
  }

  function handleSizeChange(e: SelectChangeEvent<number>) {
    const next = Number(e.target.value);
    onPageSizeChange?.(next);
    // Trocar tamanho pode invalidar a página atual (menos páginas total).
    setCurrentPage(0);
  }

  const showSizeSelect = pageSize != null && onPageSizeChange != null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
        alignItems: "center",
        rowGap: 1,
        my: 4,
        color: textColor,
      }}
    >
      <Box sx={{ justifySelf: { xs: "center", sm: "start" }, px: 1 }}>
        {pageItemsCount != null && (
          <Typography variant="body2" sx={{ color: textColor, whiteSpace: "nowrap" }}>
            {pageItemsCount} {pageItemsCount === 1 ? "item" : "itens"} nesta página
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: { xs: 0.5, sm: 1 },
          flexWrap: "wrap",
        }}
      >
        <Tooltip title="Primeira página">
          <span>
            <Button
              variant="outlined"
              sx={buttonSx}
              onClick={() => goTo(0)}
              disabled={isFirstPage}
              aria-label="Primeira página"
            >
              <BsChevronDoubleLeft />
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Página anterior">
          <span>
            <Button
              variant="outlined"
              sx={buttonSx}
              onClick={() => goTo(currentPage - 1)}
              disabled={isFirstPage}
              aria-label="Página anterior"
            >
              <BsChevronLeft />
            </Button>
          </span>
        </Tooltip>
        <Box
          component="span"
          sx={{ mx: { xs: 1, sm: 2 }, whiteSpace: "nowrap", fontSize: { xs: "0.9em", sm: "1em" } }}
        >
          Página {totalPages === 0 ? 0 : currentPage + 1} de {totalPages}
        </Box>
        <Tooltip title="Próxima página">
          <span>
            <Button
              variant="outlined"
              sx={buttonSx}
              onClick={() => goTo(currentPage + 1)}
              disabled={isLastPage}
              aria-label="Próxima página"
            >
              <BsChevronRight />
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Última página">
          <span>
            <Button
              variant="outlined"
              sx={buttonSx}
              onClick={() => goTo(totalPages - 1)}
              disabled={isLastPage}
              aria-label="Última página"
            >
              <BsChevronDoubleRight />
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ justifySelf: { xs: "center", sm: "end" }, display: "flex", alignItems: "center", gap: 1, px: 1 }}>
        {showSizeSelect && (
          <>
            <Typography variant="body2" sx={{ color: textColor, whiteSpace: "nowrap" }}>
              Itens por página:
            </Typography>
            <FormControl size="small" variant="outlined">
              <Select<number>
                value={pageSize}
                onChange={handleSizeChange}
                sx={{
                  color: textColor,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: textColor },
                  "& .MuiSvgIcon-root": { color: textColor },
                }}
              >
                {pageSizeOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Pagination;
