socket.on('list:create', function(data) {
  console.log('list:create', data);
  window.lists.push(data);
});

socket.on('list:update', function(data) {
  console.log('list:update', data);

});

socket.on('list:destroy', function(data) {
  console.log('list:destroy', data);
});

socket.on('multido:update', function(data) {
  console.log('multido:update', data);
});


