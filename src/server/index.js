const express = require('express');
const app = express();
const post = 5000;
const http = app.listen(post, () =>
  console.log(`Server is running on port ${5000}`),
);
const io = require('socket.io')(http);

const LINE = [
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
];
const GI = [
  [1, 1, 1],
  [0, 0, 1],
  [0, 0, 0],
];
const GI2 = [
  [1, 1, 1],
  [1, 0, 0],
  [0, 0, 0],
];
const SQUARE = [
  [1, 1],
  [1, 1],
];
const ZI = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0],
];
const ZI2 = [
  [0, 1, 1],
  [1, 1, 0],
  [0, 0, 0],
];
const TI = [
  [1, 1, 1],
  [0, 1, 0],
  [0, 0, 0],
];

const RED = {
  main: '#c00',
  lighter: '#f00',
  darker: '#980000',
};
const ORANGE = {
  main: '#f77700',
  lighter: '#f7923a',
  darker: '#9b4e00',
};
const YELLOW = {
  main: '#cccc00',
  lighter: '#feff00',
  darker: '#9a9800',
};
const GREEN = {
  main: '#129c0a',
  lighter: '#3bd652',
  darker: '#077001',
};
const BLUE = {
  main: '#06cccc',
  lighter: '#0cffff',
  darker: '#108d8e',
};
const PURPLE = {
  main: '#0d05f3',
  lighter: '#3033f2',
  darker: '#020279',
};
const VIOLET = {
  main: '#9901cc',
  lighter: '#cc02ff',
  darker: '#660099',
};

// Each room has players
// Each player has his own game field with pile and tetro

class Player {
  constructor({ id }) {
    this.id = id;
    this.pile = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    this.tetroIndex = -1;
    this.tetro = null;
    this.game = null;
  }

  setGame(game) {
    this.game = game;
  }

  setTetro() {
    this.tetroIndex += 1;
    this.tetro = this.game.getTetro(this.tetroIndex);
    io.to(this.id).emit('set-tetro', { tetro: this.tetro });
  }

  setPile(pile) {
    this.pile = pile;
  }

  getPlayerData() {
    return {
      id: this.id,
      pile: this.pile,
      tetro: this.tetro,
    };
  }
}

class Game {
  constructor(room, players) {
    this.room = room;
    this.players = players;
    this.tetros = [this.getRandomTetro()];

    this.players.forEach(player => {
      player.setGame(this);
      player.setTetro();
    });
  }

  getTetro(tetroIndex) {
    if (this.tetros[tetroIndex]) {
      return this.tetros[tetroIndex];
    }
    this.tetros = [...this.tetros, this.getRandomTetro()];
    return this.tetros[tetroIndex];
  }

  getRandomTetro() {
    const figures = [LINE, GI, GI2, SQUARE, ZI, ZI2, TI];
    const colors = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE, VIOLET];
    const randomFigureIndex = Math.floor(Math.random() * figures.length);
    const randomColorIndex = Math.floor(Math.random() * colors.length);

    return {
      figure: figures[randomFigureIndex],
      row: 0,
      col: 4,
      color: colors[randomColorIndex],
    };
  }

  getGameData() {
    return {
      players: this.players.map(player => player.getPlayerData()),
      tetro: this.tetros[this.tetros.length - 1],
    };
  }
}

class Room {
  constructor({ id, name, leader, players = [] }) {
    this.id = id;
    this.name = name;
    this.leader = leader;
    this.players = players;
    this.game = null;
  }

  addPlayer(playerId) {
    this.players = [...this.players, new Player({ id: playerId })];
  }

  startGame() {
    this.game = new Game(this, this.players);
  }

  endGame() {
    this.game = null;
  }

  getRoomData() {
    return {
      id: this.id,
      name: this.name,
      leader: this.leader,
      players: this.players.map(player => player.getPlayerData()),
      game: this.game ? this.game.getGameData() : null,
    };
  }
}

const rooms = {};

io.use((socket, next) => {
  console.log(socket.id, socket.request._query.login);
  next();
});

io.on('connection', socket => {
  io.to(socket.id).emit('send-id', {
    id: socket.id,
  });
  io.to(socket.id).emit('update-rooms', {
    rooms: Object.keys(rooms).map(id => ({ id, ...rooms[id].getRoomData() })),
  });

  socket.on('start-game', ({ roomId }) => {
    const room = rooms[roomId];

    if (room && socket.id === room.leader) {
      room.startGame();
      room.players.forEach(player => {
        io.to(player.id).emit('update-room', {
          room: rooms[roomId].getRoomData(),
        });
      });
    }
  });

  socket.on('create-room', ({ name }) => {
    const newRoomId = Object.keys(rooms).length
      ? Math.max(...Object.keys(rooms).map(roomId => parseInt(roomId))) + 1 + ''
      : '0';

    console.log('leader', socket.id);

    rooms[newRoomId] = new Room({
      id: newRoomId,
      name,
      leader: socket.id,
      players: [new Player({ id: socket.id })],
    });
    io.to(socket.id).emit('send-room', {
      room: rooms[newRoomId].getRoomData(),
    });
    console.log(rooms);
  });

  socket.on('join-room', ({ roomId }) => {
    const room = rooms[roomId];

    if (room) {
      room.addPlayer(socket.id);
      io.to(socket.id).emit('send-room', {
        room: rooms[roomId].getRoomData(),
      });
      socket.broadcast.emit('update-room', {
        room: rooms[roomId].getRoomData(),
      });
    }
    console.log(rooms);
  });

  socket.on('get-tetro', ({ roomId, playerId }) => {
    const room = rooms[roomId];

    if (room) {
      const player = room.players.find(player => player.id === playerId);

      if (player) {
        player.setTetro();
      }
    }
  });

  socket.on('set-pile', ({ roomId, playerId, pile }) => {
    const room = rooms[roomId];

    if (room) {
      const player = room.players.find(player => player.id === playerId);

      if (player) {
        player.setPile(pile);
        socket.broadcast.emit('set-other-pile', {
          roomId,
          playerId,
          pile,
        });
      }
    }
  });
});
