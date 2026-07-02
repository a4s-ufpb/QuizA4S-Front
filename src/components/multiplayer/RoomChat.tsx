import { useEffect, useRef, useState, type FormEvent } from "react";
import { Card, Form, Button, InputGroup } from "react-bootstrap";
import type { UseGameRoom } from "../../hooks/useGameRoom";

interface RoomChatProps {
  room: UseGameRoom;
}

/** Chat da sala em tempo real (mensagens efêmeras). */
const RoomChat = ({ room }: RoomChatProps) => {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [room.messages]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    room.sendChat(content);
    setText("");
  }

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="fw-bold">Chat</Card.Header>
      <Card.Body className="d-flex flex-column p-2" style={{ minHeight: "300px" }}>
        <div
          ref={listRef}
          className="flex-grow-1 overflow-auto mb-2 px-1"
          style={{ maxHeight: "340px" }}
        >
          {room.messages.length === 0 && (
            <p className="text-muted text-center small mt-3">
              Nenhuma mensagem ainda.
            </p>
          )}
          {room.messages.map((m, i) => (
            <div key={i} className="mb-1">
              <strong
                className={m.playerId === room.playerId ? "text-primary" : ""}
              >
                {m.name}:
              </strong>{" "}
              <span>{m.content}</span>
            </div>
          ))}
        </div>
        <Form onSubmit={submit}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Mensagem..."
              value={text}
              maxLength={300}
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit" variant="primary">
              Enviar
            </Button>
          </InputGroup>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RoomChat;
