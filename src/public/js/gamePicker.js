$(document).ready((e) => {
  const socket = io();
  const createdGames = [];
  socket.on('connect', () => {
    //join the socket lobby
    socket.emit('joinLobby');

    let table;
    socket.on('gameCreate', (e) => {
      if(createdGames.includes(e.game.id)){return;}
      table.row.add([e.game.id, e.game.players, e.game.createdOn, '<button type="button" class="btn btn-primary">Join</button>']).draw(false)
    });

    socket.on('clientGameJoin', (e) => {
      $(`#${e.game} #players`).html(e.numCurrentPlayers);
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
              <td id="players">${ele.players.length}</td>
              <td>${ele.createdOn}</td>
              <td><button class="btn btn-primary">Join</button></td>
          </tr>
        `);
      });
      table = $(`#lobbies`).DataTable();

      $('#lobbies button').on('click', prompForNameContinueToGame);


      $(`.paginate_button`).on('click', () => {
        $('#lobbies button').on('click', prompForNameContinueToGame);
      });

      $('input').change((e)=> {
				$('#lobbies button').on('click', prompForNameContinueToGame);
			});

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
              table.row.add([e.game._id, e.game.players.length, e.game.createdOn, '<button class="btn btn-primary">Join</button>']).draw(false);
                createdGames.push(e.game._id);
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
	
	function prompForNameContinueToGame(){
		console.log(1)
		let playerName;
		const localPlayerName = localStorage.getItem('name');
		if(localPlayerName !== null){
			playerName = localPlayerName;
		} else {
			playerName = prompt('What would you like your game name to be?');
			localStorage.setItem('name', playerName);
		}

		const gameID = $(this).parent().parent().attr('id');
		console.log(gameID)
		if(gameID){
			location.href = `${location.protocol}//${location.hostname}:${location.port}/${gameID}/game?name=${encodeURI(playerName)}`;
		}
	}

});