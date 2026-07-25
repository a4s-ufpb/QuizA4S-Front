import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import {
  useMyStatisticFeedbackQuery,
  useCreatorStatisticFeedbackQuery,
} from "../../../query/useStatisticFeedbackQueries";
import type { StatisticFeedback } from "../../../types";

const FeedbackList = ({ items, mode }: { items: StatisticFeedback[]; mode: "received" | "sent" }) => {
  if (items.length === 0) {
    return (
      <NotFoundComponent
        title={
          mode === "received"
            ? "Você ainda não recebeu feedbacks"
            : "Você ainda não enviou feedbacks aos jogadores"
        }
      />
    );
  }
  return (
    <Stack spacing={1.5}>
      {items.map((f) => (
        <Card key={f.id} elevation={1}>
          <CardContent>
            <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2">
                {mode === "received" ? `De: ${f.creatorName}` : `Para: ${f.studentName}`}
              </Typography>
              <Chip label={f.themeName} size="small" />
            </Stack>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{f.text}</Typography>
            <Typography variant="caption" color="text.secondary">
              {f.createdAt}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

const MyFeedbacks = () => {
  const [tab, setTab] = useState(0);
  const receivedQuery = useMyStatisticFeedbackQuery(tab === 0);
  const sentQuery = useCreatorStatisticFeedbackQuery(tab === 1);

  const received = receivedQuery.data?.success ? receivedQuery.data.data : [];
  const sent = sentQuery.data?.success ? sentQuery.data.data : [];
  const loading = receivedQuery.isLoading || sentQuery.isLoading;

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Typography variant="h5" gutterBottom>Meus Feedbacks</Typography>
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Recebidos" />
        <Tab label="Enviados (como criador)" />
      </Tabs>

      {tab === 0 && <FeedbackList items={received} mode="received" />}
      {tab === 1 && <FeedbackList items={sent} mode="sent" />}

      {loading && <Loading />}
    </Box>
  );
};

export default MyFeedbacks;
