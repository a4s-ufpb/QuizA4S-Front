import type { Dispatch, SetStateAction } from "react";
import { Box, Button, Tooltip } from "@mui/material";
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
}

const Pagination = ({
  totalPages,
  currentPage,
  setCurrentPage,
  color,
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

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: { xs: 0.5, sm: 1 },
        flexWrap: "wrap",
        my: 4,
        color: textColor,
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
  );
};

export default Pagination;
