// src/components/table.jsx

import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import '../css/table.css';

const Table = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState([]);

  const onDrop = (sourceSquare, targetSquare) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Siempre promueve a la reina
    });

    if (move) {
      setFen(game.fen());
      setHistory(game.history());
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setHistory([]);
  };

  return (
    <div className="chess-container">
      <Chessboard
          position={fen}
          style={{ width: '300px', height: '300px' }} // Usa estilos en línea para establecer el tamaño
          onPieceDrop={onDrop}
        />

      <button onClick={resetGame} className="reset-button">Reiniciar Juego</button>
    </div>
  );
};

export default Table;
