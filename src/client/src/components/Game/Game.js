import React from 'react';
import { connect } from 'react-redux';
import './Game.css';
import { Tetromino } from '../Tetromino';
import {
  moveTetro,
  moveTetroDown,
  dropTetro,
  rotateTetro,
} from '../../actions';
import { LEFT, RIGHT, DOWN, UP } from '../../constants';
import { Pile } from '../Pile';
import { store } from '../../index';
import { Others } from '../Others';

const keyDownHandler = ({ key }) => {
  switch (key) {
    case LEFT: {
      store.dispatch(moveTetro({ left: -1, top: 0 }));
      break;
    }
    case RIGHT: {
      store.dispatch(moveTetro({ left: 1, top: 0 }));
      break;
    }
    case UP: {
      store.dispatch(rotateTetro());
      break;
    }
    case DOWN: {
      store.dispatch(dropTetro());
      break;
    }
    default: {
      return null;
    }
  }
};

window.setInterval(() => store.dispatch(moveTetroDown()), 750);

window.addEventListener('keydown', keyDownHandler);

const startGame = (socket, room) => () => {
  console.log('start game click', socket, room);
  socket.emit('start-game', {
    roomId: room.id,
  });
};

const renderStartGameButton = (socket, myData, room) =>
  myData.id === room.leader && !room.game ? (
    <button className="start-game-button" onClick={startGame(socket, room)}>
      START
    </button>
  ) : null;

const renderGameDetails = (socket, myData, room) => (
  <div className="game-details">
    {renderStartGameButton(socket, myData, room)}
    <Others />
  </div>
);

const renderField = () => (
  <div className="field" tabIndex={0}>
    <Tetromino />
    <Pile />
  </div>
);

const GameInner = ({ socket, myData, room }) => (
  <div className="room">
    <div className="field-container">{renderField()}</div>
    <div className="game-details-container">
      {room && renderGameDetails(socket, myData, room)}
    </div>
  </div>
);

const mapStateToProps = ({ socket, myData, room }) => ({
  socket,
  myData,
  room,
});

export const Game = connect(mapStateToProps)(GameInner);
