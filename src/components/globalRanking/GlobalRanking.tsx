import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Avatar,
} from "@mui/material";
import { BsTrophyFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useGlobalRankingQuery } from "../../query/useGlobalRankingQuery";

const GlobalRanking = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"ALL" | "WEEK">("ALL");
  const globalRankingQuery = useGlobalRankingQuery(period);
  const ranking = globalRankingQuery.data?.success
    ? globalRankingQuery.data.data.content
    : [];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_e, value) => value && setPeriod(value)}
          size="small"
        >
          <ToggleButton value="ALL">Todos os tempos</ToggleButton>
          <ToggleButton value="WEEK">Essa semana</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {ranking.length === 0 ? (
        <Typography color="text.secondary" align="center">
          Nenhuma pontuação registrada ainda.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Jogador</TableCell>
                <TableCell align="right">Pontuação total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranking.map((entry, i) => (
                <TableRow key={entry.user.uuid}>
                  <TableCell>
                    {i < 3 ? (
                      <BsTrophyFill
                        color={i === 0 ? "gold" : i === 1 ? "silver" : "#cd7f32"}
                      />
                    ) : (
                      i + 1
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
                    onClick={() => navigate(`/profile/public/${entry.user.uuid}`)}
                  >
                    <Avatar sx={{ width: 28, height: 28 }} />
                    {entry.user.name}
                  </TableCell>
                  <TableCell align="right">{entry.totalScore.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default GlobalRanking;
