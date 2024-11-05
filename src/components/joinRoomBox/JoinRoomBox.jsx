import { useState } from "react";
import "./JoinRoomBox.css";
import InformationBox from "../informationBox/InformationBox";
import { RoomService } from "../../service/RoomService";
function JoinRoomBox({ setJoinRoomBox }) {
  const [informationBox, setInformationBox] = useState(false);
  const [roomId, setRoomId] = useState("");

  const roomService = new RoomService();

   async function joinRoom() {
    roomService.connect();

    const user = localStorage.getItem("user");
    const { uuid : playerId }  = JSON.parse(user);

    roomService.joinRoom(roomId, playerId);

    const roomResponse = await roomService.findRoomById(roomId);

    console.log(roomResponse.data)
  }

  return (
    <div className="join-room-container-external">
      <div className="join-room-container">
        <div className="button-close">
          <span onClick={() => setJoinRoomBox(false)}>X</span>
        </div>
        <h2>Digite o ID da sala</h2>
        <label className="join-room-id">
          <span>ID da Sala</span>
          <input type="text" placeholder="Digite o ID da sala" value={roomId} onChange={(e) => setRoomId(e.target.value)} required/>
        </label>
        <button onClick={joinRoom} className="join-room-btn">
          Entrar
        </button>
      </div>
      {informationBox && (
        <InformationBox
          closeBox={setInformationBox}
          color={"red"}
          icon={"exclamation"}
          text={"Sala não encontrada"}
        />
      )}
    </div>
  );
}
export default JoinRoomBox;
