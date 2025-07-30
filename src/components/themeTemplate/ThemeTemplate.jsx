import { useLayoutEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Loading from "../loading/Loading";
import SearchComponent from "../searchComponent/SearchComponent";
import NotFoundComponent from "../notFound/NotFoundComponent";
import Pagination from "../pagination/Pagination";
import { DEFAULT_IMG } from "../../vite-env";
import { ApiFetch } from "../../util/ApiFetch";

const ThemeTemplate = ({ path, onClickFunction, title }) => {
  const apiFetch = new ApiFetch();

  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [themeName, setThemeName] = useState("");

  function changeName(propsThemeName) {
    setThemeName(propsThemeName);
  }

  useLayoutEffect(() => {
    setLoading(true);

    const promise = apiFetch.getPages(
      `${path}?page=${currentPage}&name=${themeName}`,
      "Tema não encontrado"
    );

    promise.then((response) => {
      if (!response.success) {
        setLoading(false);
        setTotalPages(0);
        setThemes([]);
        return;
      }

      setLoading(false);
      setTotalPages(response.totalPages);
      setThemes(response.data);
    });
  }, [currentPage, path, themeName]);

  return (
    <Container className="py-4">
      <SearchComponent
        title={title}
        url={`${path}?page=${currentPage}&name=`}
        placeholder="Digite o nome de um tema"
        onSearch={changeName}
        setCurrentPage={setCurrentPage}
        setData={setThemes}
        setTotalPages={setTotalPages}
      />

      <Row xs={1} sm={2} md={3} lg={4} className="g-4 mt-3">
        {themes &&
          themes.map((theme) => (
            <Col key={theme.id}>
              <Card
                className="h-100 text-center shadow-sm border-0"
                onClick={() => onClickFunction(theme)}
                style={{ cursor: "pointer", transition: "transform 0.3s ease-in-out" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Card.Img
                  variant="top"
                  src={
                    theme.imageUrl == null || theme.imageUrl === ""
                      ? DEFAULT_IMG
                      : theme.imageUrl
                  }
                  alt="theme-image"
                  className="p-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    margin: "0 auto",
                    borderRadius: "15px",
                  }}
                />
                <Card.Body>
                  <Card.Text>{theme.name}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
      </Row>

      {!loading && themes.length === 0 && (
        <NotFoundComponent title="Tema não encontrado!" />
      )}

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      {loading && <Loading />}
    </Container>
  );
};

export default ThemeTemplate;