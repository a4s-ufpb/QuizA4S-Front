import { useLayoutEffect, useState, type MouseEvent } from "react";
import { Box, Card, CardContent, CardMedia, Chip, Container, Stack, Typography } from "@mui/material";
import { BsHeartFill } from "react-icons/bs";
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
  searchOnButton?: boolean;
  tagIds?: number[];
  extraHeader?: React.ReactNode;
}

const ThemeTemplate = ({
  path,
  onClickFunction,
  title,
  searchOnButton = false,
  tagIds,
  extraHeader,
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

    const tagQuery = tagIds && tagIds.length > 0 ? `&tagIds=${tagIds.join(",")}` : "";
    const promise = apiFetch.getPages<Theme>(
      `${path}?page=${currentPage}&name=${themeName}${tagQuery}`,
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
  }, [currentPage, path, themeName, tagIds?.join(",")]);

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
        searchOnButton={searchOnButton}
      />

      {extraHeader}

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
                <Stack direction="row" spacing={0.5} sx={{ mt: 1, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                  <Chip
                    icon={<BsHeartFill color="#e74c3c" />}
                    label={theme.likeCount ?? 0}
                    size="small"
                    variant="outlined"
                  />
                  {(theme.tags ?? []).slice(0, 2).map((t) => (
                    <Chip key={t.id} label={t.name} size="small" variant="outlined" />
                  ))}
                </Stack>
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
