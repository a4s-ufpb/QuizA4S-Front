import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
  Modal,
} from "react-bootstrap";
import {
  PersonFill,
  StarFill,
  XCircle,
  BoxArrowRight,
} from "react-bootstrap-icons";
import type { UseGameRoom } from "../../hooks/useGameRoom";
import type { PlayerView } from "../../types/game";
import ThemeTemplate from "../themeTemplate/ThemeTemplate";
import ConfirmBox from "../confirmBox/ConfirmBox";
import RoomChat from "./RoomChat";
import RoomConfigForm from "./RoomConfigForm";
import "./multiplayer.css";

interface LobbyProps {
  room: UseGameRoom;
}

const Lobby = ({ room }: LobbyProps) => {
  const navigate = useNavigate();
  const [showThemes, setShowThemes] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [kickTarget, setKickTarget] = useState<PlayerView | null>(null);

  const state = room.state!;
  const me = state.players.find((p) => p.id === room.playerId);
  const isTeamMode = state.config.roomMode === "TEAM";
  const allReady = state.players.filter((p) => !p.host).every((p) => p.ready);
  const canStart = room.isHost && state.themeId != null && allReady;

  function leaveRoom() {
    room.leave();
    navigate("/multiplayer");
  }

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col>
          <h2 className="mb-1 text-white">
            Sala <span className="mp-code-chip">{state.code}</span>
          </h2>
          <div className="text-white-50">
            Quiz: <strong>{state.themeName || "nenhum selecionado"}</strong> ·{" "}
            {isTeamMode ? "Equipes" : "Individual"} ·{" "}
            {state.config.questionCount} questões ·{" "}
            {state.config.questionTimeSeconds}s
          </div>
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => setConfirmLeave(true)}
          >
            <BoxArrowRight className="me-1" /> Sair da sala
          </Button>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm border-0 mb-3 mp-fade-in">
            <Card.Header className="fw-bold">
              Jogadores ({state.players.length})
            </Card.Header>
            <ListGroup variant="flush">
              {state.players.map((p) => (
                <ListGroup.Item
                  key={p.id}
                  className="d-flex align-items-center gap-2 mp-player-item"
                >
                  {p.host ? (
                    <StarFill className="text-warning" title="Líder" />
                  ) : (
                    <PersonFill className="text-secondary" />
                  )}
                  <span className="flex-grow-1">
                    {p.name}
                    {p.id === room.playerId && " (você)"}
                    {isTeamMode && p.teamId && (
                      <Badge bg="info" className="ms-2">
                        {state.teams.find((t) => t.id === p.teamId)?.name}
                      </Badge>
                    )}
                  </span>
                  {!p.host &&
                    (p.ready ? (
                      <Badge bg="success" className="mp-ready-badge">
                        Pronto
                      </Badge>
                    ) : (
                      <Badge bg="secondary">Aguardando</Badge>
                    ))}
                  {room.isHost && !p.host && (
                    <Button
                      variant="link"
                      className="text-danger p-0 ms-2"
                      title="Remover"
                      onClick={() => setKickTarget(p)}
                    >
                      <XCircle />
                    </Button>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {isTeamMode && me && !me.host && (
            <Card className="shadow-sm border-0 mb-3 mp-fade-in">
              <Card.Header className="fw-bold">Escolha sua equipe</Card.Header>
              <Card.Body className="d-flex gap-2 flex-wrap">
                {state.teams.map((t) => (
                  <Button
                    key={t.id}
                    variant={me.teamId === t.id ? "info" : "outline-info"}
                    onClick={() => room.pickTeam(t.id)}
                  >
                    {t.name}
                  </Button>
                ))}
              </Card.Body>
            </Card>
          )}

          <div className="d-flex gap-2 flex-wrap">
            {me && !me.host && (
              <Button
                variant={me.ready ? "outline-success" : "success"}
                onClick={() => room.setReady(!me.ready)}
              >
                {me.ready ? "Cancelar pronto" : "Estou pronto"}
              </Button>
            )}
            {room.isHost && (
              <>
                <Button
                  variant="outline-primary"
                  onClick={() => setShowThemes(true)}
                >
                  {state.themeId ? "Trocar quiz" : "Selecionar quiz"}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfig(true)}
                >
                  Regras
                </Button>
                <Button
                  variant="primary"
                  disabled={!canStart}
                  onClick={room.start}
                >
                  Iniciar partida
                </Button>
              </>
            )}
          </div>
          {room.isHost && !canStart && (
            <p className="text-white-50 small mt-2">
              {state.themeId == null
                ? "Selecione um quiz para poder iniciar."
                : "Aguardando todos os jogadores ficarem prontos."}
            </p>
          )}
        </Col>

        <Col lg={5}>
          <RoomChat room={room} />
        </Col>
      </Row>

      <Modal
        show={showThemes}
        onHide={() => setShowThemes(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Selecionar quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ThemeTemplate
            path="/theme"
            title="Escolha o tema do quiz"
            onClickFunction={(theme) => {
              room.changeQuiz(theme.id);
              setShowThemes(false);
            }}
          />
        </Modal.Body>
      </Modal>

      {showConfig && (
        <RoomConfigForm
          config={state.config}
          onSave={(config) => {
            room.updateConfig(config);
            setShowConfig(false);
          }}
          onClose={() => setShowConfig(false)}
        />
      )}

      {confirmLeave && (
        <ConfirmBox
          title="Deseja sair da sala?"
          textBtn1="Sim, sair"
          textBtn2="Cancelar"
          onClickBtn1={leaveRoom}
          onClickBtn2={() => setConfirmLeave(false)}
        />
      )}

      {kickTarget && (
        <ConfirmBox
          title={`Remover ${kickTarget.name} da sala?`}
          textBtn1="Remover"
          textBtn2="Cancelar"
          onClickBtn1={() => {
            room.kick(kickTarget.id);
            setKickTarget(null);
          }}
          onClickBtn2={() => setKickTarget(null)}
        />
      )}
    </Container>
  );
};

export default Lobby;
