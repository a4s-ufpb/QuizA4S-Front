import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { apiAxios } from '../axios/AxiosConfig';

export class RoomService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const socket = new SockJS('http://localhost:8080/ws');
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: (str) => console.log(str),
        onConnect: () => {
          this.connected = true;
          console.log('Connected to WebSocket');
          resolve();
        },
        onStompError: (frame) => {
          console.error('Broker error: ' + frame.headers['message']);
          console.error('Details: ' + frame.body);
          reject(frame);
        },
      });
      this.stompClient.activate();
    });
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected = false;
      console.log('Disconnected from WebSocket');
    }
  }

  sendMessage(destination, body) {
    if (this.connected && this.stompClient) {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error('WebSocket not connected');
    }
  }

  joinRoom(roomId, playerId) {
    this.sendMessage(`/app/join-room/${roomId}`, { roomId, playerId });
  }

  selectQuiz(roomId, quizId) {
    this.sendMessage(`/app/select-quiz/${roomId}`, { roomId, quizId });
  }

  startQuiz(roomId) {
    this.sendMessage(`/app/start-quiz/${roomId}`, { roomId });
  }

  quitRoom(roomId, playerId) {
    this.sendMessage(`/app/quit-room/${roomId}`, { roomId, playerId });
  }

  async handleRequest(method, url, data = null) {
    const response = {
      data: {},
      message: '',
      success: false,
    };

    try {
      const asyncResponse = await apiAxios[method](url, data);
      response.data = asyncResponse.data;
      response.success = true;
    } catch (error) {
      response.message = error.response?.data.message || 'Tente novamente mais tarde!';
    }

    return response;
  }

  createRoom(roomRequest) {
    return this.handleRequest('post', `/room`, roomRequest);
  }

  deleteRoom(roomId) {
    return this.handleRequest('delete', `/room/${roomId}`);
  }

  findRoomById(roomId) {
    return this.handleRequest('get', `/room/${roomId}`);
  }
}