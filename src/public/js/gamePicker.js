$(document).ready((e) => {
  const socket = io();

  socket.on('connect', () => {
    //join the socket lobby
    socket.emit('joinLobby');

    socket.on('gameCreate', (e) => {
      table.row.add([e.game.id, e.game.players, e.game.createdOn, '<td><button type="button" class="btn btn-primary">Join</button></td>']).draw(false)
    });

    socket.on('gameFull', (e) => {
      const row = $(`tr #${e.game}`);
      table.row(row).remove().draw();
    });

    $.get('/api/game?isComplete=false', (data) => {
      data.games.forEach((ele) => {
        if(ele.players.length > 5){
          return;
        }
        $(`#lobbies tbody`).append(`
        <tr id="${ele._id}">
            <td>${ele._id}</td>
            <td>${ele.players.length}</td>
            <td>${ele.createdOn}</td>
            <td><button type="button" class="btn btn-primary">Join</button></td>
        </tr>
      `);
      });
      $('#lobbies button').on('click', (e) => {
        const playerName = prompt('What would you like your game name to be?');
        const gameID = $(e.target).parent().parent().attr('id');
        if(gameID){
          location.href = `${location.protocol}//${location.hostname}:${location.port}/${gameID}/game?name=${encodeURI(playerName)}`;
        }
      });

      const table = $('#lobbies').DataTable();
      $(`#createGame`).on('click', (e) => {
        $.get('/api/game?isComplete=false', (games) => {
          console.log(games)
          if(games.games.length > 50){
            return alert('You cannot create a new game until there are less than 50 active or in progress.');
          }

          $.ajax({
            method: 'POST',
            url: '/api/game',
            contentType: 'application/json',
            data: JSON.stringify({
              isComplete: false,
              players: [],
            }),
            success: (e) => {
                table.row.add([e.game._id, e.game.players.length, e.game.createdOn, '<td><button type="button" class="btn btn-primary">Join</button></td>']).draw(false);
                socket.emit('gameCreate', {
                  game: {
                    id: e.game._id,
                    players: e.game.players.length,
                    createdOn: e.game.createdOn,
                  }
                })
              },
          })
        });
      });
    });
  });

});