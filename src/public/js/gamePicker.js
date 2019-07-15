$(document).ready((e) => {
  $.get('/api/game?isComplete=false', (data) => {
    data.games.forEach((ele) => {
      $(`#lobbies tbody`).append(`
        <tr id="${ele._id}">
            <td>${ele._id}</td>
            <td>${ele.players.length}</td>
            <td>${ele.createdOn}</td>
            <td><button type="button" class="btn btn-primary">Join</button></td>
        </tr>
      `);
    });
    $('button').on('click', (e) => {
      const playerName = prompt('What would you like your game name to be?');
      const gameID = $(e.target).parent().parent().attr('id');
      if(gameID){
        location.href = `${location.protocol}//${location.hostname}:${location.port}/${gameID}/game?name=${playerName}`;
      }
    });
    $('#lobbies').DataTable();
  });


});