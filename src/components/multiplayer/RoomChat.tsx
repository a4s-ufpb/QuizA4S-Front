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

const MAX_MESSAGE_LENGTH = 50;
const QUICK_REACTIONS = ["👍", "😂", "😮", "❤️", "😢", "🔥"];

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
    <Card
      elevation={2}
      sx={{
        height: 500,
        maxHeight: "70vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
          {room.messages.map((m, i) => {
            const isMine = m.playerId === room.playerId;
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "80%",
                    bgcolor: isMine ? "primary.main" : "action.hover",
                    color: isMine ? "primary.contrastText" : "text.primary",
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.75,
                    wordBreak: "break-word",
                  }}
                >
                  {!isMine && (
                    <Typography
                      variant="caption"
                      sx={{ display: "block", fontWeight: "bold" }}
                    >
                      {m.name}
                    </Typography>
                  )}
                  <Typography variant="body2">{m.content}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
          {QUICK_REACTIONS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              title={`Reagir com ${emoji}`}
              onClick={() => room.sendChat(emoji)}
              sx={{ fontSize: "1.2em" }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
        <Box component="form" onSubmit={submit} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
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
            slotProps={{ htmlInput: { maxLength: MAX_MESSAGE_LENGTH } }}
            helperText={`${text.length}/${MAX_MESSAGE_LENGTH}`}
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
