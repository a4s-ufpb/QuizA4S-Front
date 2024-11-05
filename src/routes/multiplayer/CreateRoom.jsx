import { useState } from "react";
import ImgCreateRoom from "../../assets/img-create-room.webp"
import ImgJoinRoom from "../../assets/img-join-room.webp"
import { useNavigate } from "react-router-dom";
import JoinRoomBox from "../../components/joinRoomBox/JoinRoomBox";
import "./CreateRoom.css";
import { RoomService } from "../../service/RoomService";
const CreateRoom = () => {

  const navigate = useNavigate();

  const [showJoinRoomBox, setJoinRoomBox] = useState(false);

  const roomService = new RoomService();

  async function createRoom() {
    const user = localStorage.getItem("user");
    const { uuid : userId }  = JSON.parse(user);
    const roomRequest = {
        creatorId: userId,
    }

    const roomResponse = await roomService.createRoom(roomRequest);

    console.log(roomResponse.data)
  }

  return (
    <div className="container-create-room">
      <div className="container-room">
        <div className="container-room-header">
          <h2>Crie ou Entre em uma Sala</h2>
        </div>
        <div className="container-room-buttons">
          <div className="room-btn" onClick={createRoom}>
            <h2>Criar Sala</h2>
            <img src={ImgCreateRoom} alt="img-room-quiz" width="300" height="300"></img>
          </div>
          <div className="room-btn" onClick={() => setJoinRoomBox(true)}>
            <h2>Entrar na Sala</h2>
            <img src={ImgJoinRoom} alt="img-select-quiz" width="300" height="300"></img>
          </div>
        </div>
      </div>
      {showJoinRoomBox && <JoinRoomBox setJoinRoomBox={setJoinRoomBox}/>}
    </div>
  );
};
export default CreateRoom;