import React, { useState } from "react";
import { createClient } from "pexels";
import { BsSearch } from "react-icons/bs";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import "./SearchImage.css";

function SearchImage({ setSearchImage, getUrlOfImage }) {
  const client = createClient(
    "VobhRhGYqprkaxYAvXjE07UsDOglWJwSU4cHbpWu0qGphVyZQUGW3CSS"
  );

  const [imageName, setImageName] = useState("");
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [informationBox, setInformationBox] = useState(false);

  function searchImage() {
    setLoading(true);

    client.photos
      .search({ query: imageName, per_page: 40 })
      .then((response) => {
        setLoading(false);
        setImages(response.photos);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
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
          />
          <BsSearch onClick={searchImage} className="search-image-button" />
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
        </div>
      </div>

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
