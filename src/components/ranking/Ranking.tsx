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
  Typography,
} from "@mui/material";
import Loading from "../loading/Loading";
import { useEffect, useState } from "react";
import { ScoreService } from "../../service/ScoreService";
import NotFoundComponent from "../notFound/NotFoundComponent";
import { getStoredTheme } from "../../util/storage";
import type { Score } from "../../types";
import "./Ranking.css";

interface RankingProps {
  navigatePath: string;
  setShowRanking: (value: boolean) => void;
}

const Ranking = ({ navigatePath, setShowRanking }: RankingProps) => {
  const scoreService = new ScoreService();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { name: themeName } = getStoredTheme();

  const [ranking, setRanking] = useState<Score[]>([]);
  const [isNotFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { id: themeId } = getStoredTheme();

      setLoading(true);
      const response = await scoreService.findRankingByTheme(themeId);
      setLoading(false);

      if (!response.success) {
        setNotFound(true);
        return;
      }

      setRanking(response.data);
    }
    fetchData();
  }, []);

  function closeRanking() {
    setShowRanking(false); // muda o estado do ranking
    navigate(navigatePath);
  }

  return (
    <Dialog open={true} onClose={closeRanking} fullWidth maxWidth="md">
      <DialogTitle sx={{ bgcolor: "primary.main", color: "#fff" }}>
        Ranking
      </DialogTitle>
      <DialogContent sx={{ maxHeight: "60vh", overflowY: "auto" }}>
        <Box>
          <Typography
            sx={{
              textAlign: "center",
              bgcolor: "primary.main",
              color: "#fff",
              borderRadius: 50,
              px: 3,
              py: 1,
              mb: 3,
            }}
          >
            Tema: {themeName}
          </Typography>
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
                      {score.user.name}
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
