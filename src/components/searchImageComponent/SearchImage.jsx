import React, { useState } from "react";
import { createClient } from "pexels";
import { BsSearch } from "react-icons/bs";

function SearchImage() {
  const client = createClient(
    "VobhRhGYqprkaxYAvXjE07UsDOglWJwSU4cHbpWu0qGphVyZQUGW3CSS"
  );

  const [imageName, setImageName] = useState("");
  const [images, setImages] = useState([])

  function searchImage() {
    client.photos
      .search({ query: imageName, per_page: 40 })
      .then((response) => {
        setImages(response.photos);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div className="container-search-image">
      <div className="search-image">
        <label>
          <input
            type="text"
            placeholder="Digite o nome da imagem"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
          />
          <BsSearch onClick={searchImage} />
        </label>

        <div className="search-image-data">
          {images && images.map((img) => (
            <div key={img.id}>
              <img src={img.src.medium} alt={img.alt} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchImage;
