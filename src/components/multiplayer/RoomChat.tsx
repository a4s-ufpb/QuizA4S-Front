import { useEffect, useRef, useState, type FormEvent } from "react";
import { Box, Card, CardHeader, CardContent, TextField, Button, Typography } from "@mui/material";
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
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardHeader title="Chat" />
      <CardContent sx={{ display: "flex", flexDirection: "column", p: 1, minHeight: "300px" }}>
        <Box
          ref={listRef}
          sx={{ flexGrow: 1, overflow: "auto", mb: 2, px: 1, maxHeight: "340px" }}
        >
          {room.messages.length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
              Nenhuma mensagem ainda.
            </Typography>
          )}
          {room.messages.map((m, i) => (
            <Box key={i} sx={{ mb: 1 }}>
              <strong
                style={{
                  color: m.playerId === room.playerId ? "#3f7fd6" : undefined,
                }}
              >
                {m.name}:
              </strong>{" "}
              <span>{m.content}</span>
            </Box>
          ))}
        </Box>
        <Box component="form" onSubmit={submit} sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Mensagem..."
            value={text}
            slotProps={{ htmlInput: { maxLength: 300 } }}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" variant="contained">
            Enviar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomChat;
