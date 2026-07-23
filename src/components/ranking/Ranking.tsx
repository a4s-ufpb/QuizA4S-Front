import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Box,
} from "@mui/material";
import Loading from "../loading/Loading";
import { useRankingByThemeQuery } from "../../query/useScoreQueries";
import NotFoundComponent from "../notFound/NotFoundComponent";
import { getStoredTheme } from "../../util/storage";
import "./Ranking.css";

interface RankingProps {
  navigatePath: string;
  setShowRanking: (value: boolean) => void;
}

const Ranking = ({ navigatePath, setShowRanking }: RankingProps) => {
  const navigate = useNavigate();

  const { id: themeId, name: themeName } = getStoredTheme();

  const rankingQuery = useRankingByThemeQuery(themeId);
  const loading = rankingQuery.isLoading;
  const ranking = rankingQuery.data?.success ? rankingQuery.data.data : [];
  const isNotFound = rankingQuery.isSuccess && !rankingQuery.data.success;

  function closeRanking() {
    setShowRanking(false); // muda o estado do ranking
    navigate(navigatePath);
  }

  return (
    <Dialog open={true} onClose={closeRanking} fullWidth maxWidth="md">
      <DialogTitle sx={{ bgcolor: "primary.main", color: "#fff" }}>
        Ranking — {themeName}
      </DialogTitle>
      <DialogContent sx={{ maxHeight: "60vh", overflowY: "auto" }}>
        <Box sx={{ mt: 2 }}>
          {ranking && ranking.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "80%" }}>Usuário</TableCell>
                  <TableCell sx={{ width: "20%", textAlign: "center" }}>
                    Pontuação
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ranking.map((score, index) => (
                  <TableRow key={score.id} hover>
                    <TableCell>
                      <span className={`rank-icon rank-${index + 1}`}>
                        {index + 1}
                      </span>
                      <span
                        style={{ color: "#1976d2", textDecoration: "underline", cursor: "pointer" }}
                        onClick={() => navigate(`/profile/public/${score.user.uuid}`)}
                      >
                        {score.user.name}
                      </span>
                    </TableCell>
                    <TableCell align="center">{score.result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
          {isNotFound && (
            <NotFoundComponent title="Nenhuma pontuação cadastrada" />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={closeRanking}>
          Voltar
        </Button>
      </DialogActions>
      {loading && <Loading />}
    </Dialog>
  );
};

export default Ranking;
