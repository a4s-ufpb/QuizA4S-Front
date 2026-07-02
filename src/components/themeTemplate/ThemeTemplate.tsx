import { useLayoutEffect, useState, type MouseEvent } from "react";
import { Box, Card, CardContent, CardMedia, Container, Typography } from "@mui/material";
import Loading from "../loading/Loading";
import SearchComponent from "../searchComponent/SearchComponent";
import NotFoundComponent from "../notFound/NotFoundComponent";
import Pagination from "../pagination/Pagination";
import { DEFAULT_IMG } from "../../vite-env";
import { ApiFetch } from "../../util/ApiFetch";
import type { Theme } from "../../types";

interface ThemeTemplateProps {
  path: string;
  onClickFunction: (theme: Theme) => void;
  title: string;
}

const ThemeTemplate = ({
  path,
  onClickFunction,
  title,
}: ThemeTemplateProps) => {
  const apiFetch = new ApiFetch();

  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [themeName, setThemeName] = useState("");

  function changeName(propsThemeName: string) {
    setThemeName(propsThemeName);
  }

  useLayoutEffect(() => {
    setLoading(true);

    const promise = apiFetch.getPages<Theme>(
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
    <Container sx={{ py: 4 }}>
      <SearchComponent
        title={title}
        url={`${path}?page=${currentPage}&name=`}
        placeholder="Digite o nome de um tema"
        onSearch={changeName}
        setCurrentPage={setCurrentPage}
        setData={setThemes}
        setTotalPages={setTotalPages}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
            lg: "1fr 1fr 1fr 1fr",
          },
          gap: 3,
          mt: 3,
        }}
      >
        {themes &&
          themes.map((theme) => (
            <Card
              key={theme.id}
              elevation={2}
              sx={{ height: "100%", textAlign: "center", cursor: "pointer" }}
              onClick={() => onClickFunction(theme)}
              style={{ transition: "transform 0.3s ease-in-out" }}
              onMouseEnter={(e: MouseEvent<HTMLDivElement>) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseLeave={(e: MouseEvent<HTMLDivElement>) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <CardMedia
                component="img"
                image={
                  theme.imageUrl == null || theme.imageUrl === ""
                    ? DEFAULT_IMG
                    : theme.imageUrl
                }
                alt="theme-image"
                sx={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  margin: "0 auto",
                  borderRadius: "15px",
                  p: 3,
                }}
              />
              <CardContent>
                <Typography>{theme.name}</Typography>
              </CardContent>
            </Card>
          ))}
      </Box>

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
