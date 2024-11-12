import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import '../css/table.css';

const Table = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [socket, setSocket] = useState(null);
  const [userColor, setUserColor] = useState(null); // Color del usuario
  const [showColorModal, setShowColorModal] = useState(true); // Mostrar selección de color

  useEffect(() => {
    const newSocket = new WebSocket('ws://127.0.0.1:8000/ws/game-id');
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log('Conexión establecida con el servidor');
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        console.error('Error del servidor:', data.error);
      } else {
        if (data.fen) {
          setFen(data.fen);
          setHistory(game.history());
        }

        if (data.ai_move) {
          game.move(data.ai_move);
          setFen(game.fen());
        }

        if (data.is_game_over) {
          if (data.result === 'checkmate') {
            setGameResult('¡Jaque mate!');
          } else if (data.result === 'draw') {
            setGameResult('¡Empate!');
          }
        }
      }
    };

    newSocket.onclose = () => {
      console.log('Conexión cerrada con el servidor');
    };

    return () => {
      newSocket.close();
    };
  }, []);

  const handleColorSelection = (color) => {
    setUserColor(color);
    setShowColorModal(false);

    if (socket) {
      socket.send(JSON.stringify({ command: 'set_color', color }));
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    // Si ya terminó el juego o no hay conexión con el WebSocket, no hacer nada
    if (gameResult || !socket) return;
  
    // Verificar si es el turno del usuario
    const currentTurn = game.turn(); // 'w' para blancas, 'b' para negras
    if ((userColor === 'white' && currentTurn !== 'w') || (userColor === 'black' && currentTurn !== 'b')) {
      console.log("No es tu turno.");
      return;
    }
  
    // Intentar realizar el movimiento
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Siempre promueve a la reina
    });
  
    if (move) {
      // Actualizar el tablero y el historial
      setFen(game.fen());
      setHistory(game.history());
      
  
      // Enviar el movimiento al servidor
      socket.send(JSON.stringify({ command: 'move', move: move.lan }));
    } else {
      console.log("Movimiento inválido.");
    }
  };

  const resetGame = () => {
    if (socket) {
      socket.send(JSON.stringify({ command: 'restart' }));
    }

    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setHistory([]);
    setGameResult(null);
    setShowColorModal(true);
  };

  return (
    <div className="chess-container">
      {showColorModal && (
        <div className="color-modal">
          <h3 className='text-modal'>Selecciona tu color</h3>
          <div className='button-modal' onClick={() => handleColorSelection('white')}>Blancas</div>
          <div className='button-modal' onClick={() => handleColorSelection('black')}>Negras</div>
        </div>
      )}
      <Chessboard
        position={fen}
        style={{ width: '300px', height: '300px' }}
        onPieceDrop={onDrop}
      />
      {gameResult && <div className="game-result">{gameResult}</div>}
      <button onClick={resetGame} className="reset-button">Reiniciar Juego</button>
    </div>
  );
};

export default Table;
