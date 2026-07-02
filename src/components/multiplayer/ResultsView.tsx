import { useNavigate } from "react-router-dom";
import { Container, Card, Button, ListGroup, Badge } from "react-bootstrap";
import { TrophyFill } from "react-bootstrap-icons";
import type { UseGameRoom } from "../../hooks/useGameRoom";
import "./multiplayer.css";

interface ResultsViewProps {
  room: UseGameRoom;
}

/** Tela final: ranking dos jogadores (e das equipes no modo TEAM). */
const ResultsView = ({ room }: ResultsViewProps) => {
  const navigate = useNavigate();
  const state = room.state!;
  const isTeam = state.config.roomMode === "TEAM";

  const players = [...state.players]
    .filter((p) => !p.host || state.players.length === 1)
    .sort((a, b) => b.score - a.score);
  const teams = [...state.teams].sort((a, b) => b.score - a.score);

  return (
    <Container className="py-5" style={{ maxWidth: "640px" }}>
      <div className="text-center mb-4 mp-pop">
        <TrophyFill className="text-warning" size={56} />
        <h2 className="mt-2 text-white">Fim de jogo!</h2>
      </div>

      {isTeam && (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="fw-bold">Equipes</Card.Header>
          <ListGroup variant="flush">
            {teams.map((t, i) => (
              <ListGroup.Item
                key={t.id}
                className="d-flex justify-content-between align-items-center"
              >
                <span>
                  {i === 0 && <Badge bg="warning" className="me-2">1º</Badge>}
                  {t.name}
                </span>
                <strong>{t.score}</strong>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}

      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="fw-bold">Jogadores</Card.Header>
        <ListGroup variant="flush">
          {players.map((p, i) => (
            <ListGroup.Item
              key={p.id}
              className="d-flex justify-content-between align-items-center"
            >
              <span>
                <span className="me-2 fw-bold">{i + 1}º</span>
                {p.name}
                {p.id === room.playerId && " (você)"}
              </span>
              <strong>{p.score}</strong>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>

      <div className="d-flex gap-2 justify-content-center">
        <Button variant="outline-secondary" onClick={() => navigate("/multiplayer")}>
          Sair
        </Button>
      </div>
    </Container>
  );
};

export default ResultsView;
