import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import Pagination from "../pagination/Pagination";
import "./SearchImage.css";

function SearchImage({ setSearchImage, getUrlOfImage }) {
  const clientID = "VobhRhGYqprkaxYAvXjE07UsDOglWJwSU4cHbpWu0qGphVyZQUGW3CSS";

  const [imageName, setImageName] = useState("");
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [informationBox, setInformationBox] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const apiImageUrl = `https://api.pexels.com/v1/search?query=${imageName}&per_page=40&page=${currentPage}`;

  function searchImage() {
    setLoading(true);

    fetch(apiImageUrl, {
      headers: {
        Authorization: clientID,
      },
    })
      .then((response) => {
        setLoading(false);
        return response.json();
      })
      .then((data) => {
        setCurrentPage(data.page);
        setTotalPages(data.total_results);
        setImages(data.photos);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
  }

  useEffect(() => {
    if (imageName) {
      searchImage();
    }
  }, [currentPage]);

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      setCurrentPage(1);
      searchImage();
    }
  }

  return (
    <div className="container-search-image">
      <div className="search-image">
        <span
          className="search-image-button-close"
          onClick={() => setSearchImage(false)}
        >
          X
        </span>
        <label>
          <input
            type="text"
            placeholder="Digite o nome da imagem"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <BsSearch onClick={() => { setCurrentPage(1); searchImage(); }} className="search-image-button" />
        </label>

        <div className="search-image-data">
          {images &&
            images.map((img) => (
              <div key={img.id} className="image-data">
                <img
                  src={img.src.medium}
                  alt={img.alt}
                  width={140}
                  height={200}
                  onClick={() => getUrlOfImage(img.src.medium)}
                />
              </div>
            ))}

          {images && images.length === 0 && (
            <h2 style={{ textAlign: "center" }}>Nenhuma imagem encontrada</h2>
          )}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      {loading && <Loading />}
      {informationBox && (
        <InformationBox
          color="red"
          text="Imagens não encontradas"
          icon="exclamation"
          closeBox={() => setInformationBox(false)}
        />
      )}
    </div>
  );
}

export default SearchImage;
