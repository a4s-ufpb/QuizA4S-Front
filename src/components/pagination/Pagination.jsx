import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";

const Pagination = ({ totalPages, currentPage, setCurrentPage, color }) => {
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);

  useEffect(() => {
    setIsFirstPage(currentPage === 0);
    setIsLastPage(currentPage === totalPages - 1);
  }, [currentPage, totalPages]);

  function alterPage(direction) {
    if (direction === "prev" && !isFirstPage) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && !isLastPage) {
      setCurrentPage(currentPage + 1);
    }
  }

  return (
    <Container className={`d-flex justify-content-center align-items-center my-4 text-${color || "white"}`}>
      <Button
        variant={`outline-${color || "white"}`}
        className="me-2"
        onClick={() => alterPage("prev")}
        disabled={isFirstPage}
      >
        Anterior
      </Button>
      <span className="mx-3 align-self-center">
        Página {currentPage + 1} de {totalPages}
      </span>
      <Button
        variant={`outline-${color || "white"}`}
        onClick={() => alterPage("next")}
        disabled={isLastPage || totalPages === 0}
      >
        Próximo
      </Button>
    </Container>
  );
};

export default Pagination;