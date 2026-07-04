import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  Popover,
} from "@mui/material";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import type { UseGameRoom } from "../../hooks/useGameRoom";

interface RoomChatProps {
  room: UseGameRoom;
}

/** Chat da sala em tempo real (mensagens efêmeras). */
const RoomChat = ({ room }: RoomChatProps) => {
  const [text, setText] = useState("");
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function pickEmoji(data: EmojiClickData) {
    setText((prev) => prev + data.emoji);
  }

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
    <Card elevation={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader title="Chat" sx={{ flexShrink: 0 }} />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minHeight: 0,
          p: 1,
        }}
      >
        <Box
          ref={listRef}
          sx={{ flexGrow: 1, overflow: "auto", mb: 2, px: 1, minHeight: 0 }}
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
          <IconButton
            size="small"
            onClick={(e) => setEmojiAnchor(e.currentTarget)}
          >
            <BsEmojiSmile />
          </IconButton>
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
        <Popover
          open={Boolean(emojiAnchor)}
          anchorEl={emojiAnchor}
          onClose={() => setEmojiAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <EmojiPicker
            onEmojiClick={(data) => {
              pickEmoji(data);
              setEmojiAnchor(null);
            }}
          />
        </Popover>
      </CardContent>
    </Card>
  );
};

export default RoomChat;
