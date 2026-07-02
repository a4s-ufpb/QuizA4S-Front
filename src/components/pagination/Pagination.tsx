import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Box, Button } from "@mui/material";

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
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);

  useEffect(() => {
    setIsFirstPage(currentPage === 0);
    setIsLastPage(currentPage === totalPages - 1);
  }, [currentPage, totalPages]);

  function alterPage(direction: "prev" | "next") {
    if (direction === "prev" && !isFirstPage) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && !isLastPage) {
      setCurrentPage(currentPage + 1);
    }
  }

  const textColor = color || "white";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        my: 4,
        color: textColor,
      }}
    >
      <Button
        variant="outlined"
        sx={{ mr: 2, color: textColor, borderColor: textColor }}
        onClick={() => alterPage("prev")}
        disabled={isFirstPage}
      >
        Anterior
      </Button>
      <Box component="span" sx={{ mx: 3 }}>
        Página {currentPage + 1} de {totalPages}
      </Box>
      <Button
        variant="outlined"
        sx={{ color: textColor, borderColor: textColor }}
        onClick={() => alterPage("next")}
        disabled={isLastPage || totalPages === 0}
      >
        Próximo
      </Button>
    </Box>
  );
};

export default Pagination;
