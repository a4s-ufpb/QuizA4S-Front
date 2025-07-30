import { useEffect, useState } from "react";
import { Modal, Form, InputGroup, Button, Row, Col, Card } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import Pagination from "../pagination/Pagination";
import NotFoundComponent from "../notFound/NotFoundComponent";
import { SearchImageService } from "../../service/SearchImageService";

function SearchImage({ setSearchImage, getUrlOfImage }) {
  const imageService = new SearchImageService();
  const [imageName, setImageName] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [informationBox, setInformationBox] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (imageName) {
      searchImage();
    }
  }, [currentPage]);

  async function searchImage() {
    setLoading(true);
    const response = await imageService.searchImages(imageName, currentPage);
    setLoading(false);

    if (response.success) {
      const { data } = response;
      setTotalPages(data.total_results);
      setImages(data.photos);
    } else {
      console.error(response.message);
      setInformationBox(true);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      setCurrentPage(0);
      searchImage();
    }
  }

  return (
    <Modal show={true} onHide={() => setSearchImage(false)} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Pesquisar Imagem</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Digite o nome da imagem"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="primary"
              onClick={() => {
                setCurrentPage(0);
                searchImage();
              }}
            >
              <Search />
            </Button>
          </InputGroup>
        </Form.Group>

        <Row xs={2} sm={3} md={4} lg={5} className="g-3">
          {images &&
            images.map((img) => (
              <Col key={img.id}>
                <Card
                  className="shadow-sm border-0 h-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => getUrlOfImage(img.src.medium)}
                >
                  <Card.Img
                    variant="top"
                    src={img.src.medium}
                    alt={img.alt}
                    style={{
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "10px 10px 0 0",
                    }}
                  />
                </Card>
              </Col>
            ))}
        </Row>

        {images && images.length === 0 && (
          <NotFoundComponent title="Nenhuma imagem encontrada" />
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </Modal.Footer>

      {loading && <Loading />}
      {informationBox && (
        <InformationBox
          color="red"
          text="Imagens não encontradas"
          icon="exclamation"
          closeBox={() => setInformationBox(false)}
        />
      )}
    </Modal>
  );
}

export default SearchImage;