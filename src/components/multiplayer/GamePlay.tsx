import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Button, Card, ProgressBar } from "react-bootstrap";
import type { UseGameRoom } from "../../hooks/useGameRoom";
import { DEFAULT_IMG } from "../../vite-env";
import "./multiplayer.css";

interface GamePlayProps {
  room: UseGameRoom;
}

const ANSWER_VARIANTS = ["danger", "primary", "warning", "success"];

const GamePlay = ({ room }: GamePlayProps) => {
  const { question, result, state } = room;
  const inQuestion = state!.status === "IN_QUESTION";

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  // Reinicia a seleção a cada nova questão.
  useEffect(() => {
    setSelectedId(null);
  }, [question?.index]);

  // Cronômetro derivado de startAt (relógio do servidor).
  useEffect(() => {
    if (!question || !inQuestion) return;
    function tick() {
      const endAt = question!.startAt + question!.timeSeconds * 1000;
      setRemaining(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    }
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [question, inQuestion]);

  const scoreboard = useMemo(
    () => result?.scoreboard ?? [],
    [result]
  );

  if (!question) {
    return (
      <Container className="py-5 text-center text-muted">
        Preparando questão...
      </Container>
    );
  }

  function pick(alternativeId: number) {
    if (selectedId != null || !inQuestion) return;
    setSelectedId(alternativeId);
    room.answer(alternativeId);
  }

  const showResult = state!.status === "BETWEEN" && result != null;

  return (
    <Container className="py-4">
      <Row className="mb-2">
        <Col className="d-flex justify-content-between align-items-center">
          <span className="text-muted">
            Questão {question.index + 1} de {question.total}
          </span>
          {inQuestion && (
            <span
              className={`fw-bold fs-5 mp-timer ${remaining <= 5 ? "low" : ""}`}
            >
              {remaining}s
            </span>
          )}
        </Col>
      </Row>
      {inQuestion && (
        <ProgressBar
          now={(remaining / question.timeSeconds) * 100}
          className="mb-3"
        />
      )}

      <Card key={question.index} className="shadow-sm border-0 mb-4 mp-fade-in">
        <Card.Body className="text-center">
          <h3>{question.title}</h3>
          {question.imageUrl && (
            <img
              src={question.imageUrl || DEFAULT_IMG}
              alt="questão"
              style={{ maxHeight: "220px", objectFit: "contain" }}
              className="my-3"
            />
          )}
        </Card.Body>
      </Card>

      <Row className="g-3">
        {question.alternatives.map((alt, i) => {
          const isCorrect = result?.correctAlternativeId === alt.id;
          const isSelected = selectedId === alt.id;
          let variant = ANSWER_VARIANTS[i % ANSWER_VARIANTS.length];
          if (showResult) {
            variant = isCorrect
              ? "success"
              : isSelected
                ? "danger"
                : "outline-secondary";
          } else if (isSelected) {
            variant = "dark";
          }
          return (
            <Col xs={12} md={6} key={alt.id}>
              <Button
                variant={variant}
                size="lg"
                className="w-100 text-start py-3 mp-answer-btn"
                disabled={selectedId != null || !inQuestion}
                onClick={() => pick(alt.id)}
              >
                {alt.text}
                {showResult && isCorrect && " ✓"}
              </Button>
            </Col>
          );
        })}
      </Row>

      {inQuestion && selectedId != null && (
        <p className="text-center text-muted mt-3">
          Resposta enviada. Aguardando os demais...
        </p>
      )}

      {showResult && (
        <Card className="shadow-sm border-0 mt-4">
          <Card.Header className="fw-bold">Placar</Card.Header>
          <Card.Body>
            {state!.config.roomMode === "TEAM" && (
              <div className="mb-3">
                {result!.teamScoreboard.map((t) => (
                  <div key={t.id} className="d-flex justify-content-between">
                    <span>{t.name}</span>
                    <strong>{t.score}</strong>
                  </div>
                ))}
                <hr />
              </div>
            )}
            {scoreboard.slice(0, 5).map((p, i) => (
              <div key={p.id} className="d-flex justify-content-between">
                <span>
                  {i + 1}. {p.name}
                  {p.id === room.playerId && " (você)"}
                </span>
                <strong>{p.score}</strong>
              </div>
            ))}
            {room.isHost && state!.config.advanceMode === "HOST" && (
              <div className="d-grid mt-3">
                <Button variant="primary" onClick={room.next}>
                  {result!.lastQuestion ? "Ver resultado final" : "Próxima questão"}
                </Button>
              </div>
            )}
            {state!.config.advanceMode === "AUTO" && (
              <p className="text-muted text-center mt-3 mb-0">
                {result!.lastQuestion
                  ? "Finalizando..."
                  : "Próxima questão em instantes..."}
              </p>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default GamePlay;
