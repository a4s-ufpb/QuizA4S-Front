import { useEffect, useState, type KeyboardEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Card,
  CardMedia,
} from "@mui/material";
import { BsSearch } from "react-icons/bs";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import Pagination from "../pagination/Pagination";
import NotFoundComponent from "../notFound/NotFoundComponent";
import { SearchImageService } from "../../service/SearchImageService";
import type { PexelsPhoto } from "../../types";

interface SearchImageProps {
  setSearchImage: (value: boolean) => void;
  getUrlOfImage: (imageUrl: string) => void;
}

function SearchImage({ setSearchImage, getUrlOfImage }: SearchImageProps) {
  const imageService = new SearchImageService();
  const [imageName, setImageName] = useState("");
  const [images, setImages] = useState<PexelsPhoto[]>([]);
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

    if (response.success && response.data) {
      const { data } = response;
      setTotalPages(data.total_results);
      setImages(data.photos);
    } else {
      console.error(response.message);
      setInformationBox(true);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      setCurrentPage(0);
      searchImage();
    }
  }

  return (
    <Dialog open={true} onClose={() => setSearchImage(false)} fullWidth maxWidth="lg">
      <DialogTitle>Pesquisar Imagem</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Digite o nome da imagem"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="contained"
            onClick={() => {
              setCurrentPage(0);
              searchImage();
            }}
          >
            <BsSearch />
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "1fr 1fr 1fr",
              md: "1fr 1fr 1fr 1fr",
              lg: "1fr 1fr 1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          {images &&
            images.map((img) => (
              <Card
                key={img.id}
                elevation={2}
                sx={{ height: "100%", cursor: "pointer" }}
                onClick={() => getUrlOfImage(img.src.medium)}
              >
                <CardMedia
                  component="img"
                  image={img.src.medium}
                  alt={img.alt}
                  sx={{
                    height: "150px",
                    objectFit: "cover",
                  }}
                />
              </Card>
            ))}
        </Box>

        {images && images.length === 0 && (
          <NotFoundComponent title="Nenhuma imagem encontrada" />
        )}
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "center" }}>
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          color="dark"
        />
      </DialogActions>

      {loading && <Loading />}
      {informationBox && (
        <InformationBox
          color="red"
          text="Imagens não encontradas"
          icon="exclamation"
          closeBox={() => setInformationBox(false)}
        />
      )}
    </Dialog>
  );
}

export default SearchImage;
