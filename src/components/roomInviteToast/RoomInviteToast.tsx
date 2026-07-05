import { Snackbar, Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  useMyRoomInviteQuery,
  useDismissRoomInviteMutation,
} from "../../query/useRoomInviteQueries";

interface RoomInviteToastProps {
  enabled: boolean;
}

/** Snackbar global: avisa quando um amigo convida pra uma sala multiplayer. */
const RoomInviteToast = ({ enabled }: RoomInviteToastProps) => {
  const navigate = useNavigate();
  const inviteQuery = useMyRoomInviteQuery(enabled);
  const dismissMutation = useDismissRoomInviteMutation();

  const invite = inviteQuery.data?.success ? inviteQuery.data.data : null;

  if (!invite) return null;

  function handleJoin() {
    dismissMutation.mutate();
    navigate(`/room/${invite!.roomCode}`);
  }

  return (
    <Snackbar open anchorOrigin={{ vertical: "top", horizontal: "center" }}>
      <Alert
        severity="info"
        action={
          <>
            <Button color="inherit" size="small" onClick={handleJoin}>
              Entrar
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={() => dismissMutation.mutate()}
            >
              Dispensar
            </Button>
          </>
        }
      >
        {invite.fromName} convidou você pra sala {invite.roomCode}
      </Alert>
    </Snackbar>
  );
};

export default RoomInviteToast;
