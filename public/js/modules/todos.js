
function rearrange(array, fromIndex, toIndex) {
  array.splice(toIndex, 0, array.splice(fromIndex, 1)[0] );
  return array;
}

socket.on('list:create', function(data) {
  console.log('list:create', data);
  window.lists.push(data);
});

socket.on('list:destroy', function(data) {
  console.log('list:destroy', data);
});

socket.on('multido:update', function(data) {
  console.log('multido:update', data);
});

// todo title change
// $('body').on('keydown', '[data-md-list-title]', function(e) {
//   if(e.which == 13) {
//     $(this).blur();
//     e.preventDefault();
//     var newTitle = $(this).html();
//     // save the title
//   }
// });

window.todo = new Ractive({
  el: '.todos',
  template: $('#todo-template').html(),
  data: window.multido.lists[0]
});

window.todo.on('check', function(e) {
  socket.emit('list:update', window.todo.data);
});

window.todo.on('add-todo', function(e) {
  window.todo.data.todos.push({ text: 'New Todo', checked: false });
  socket.emit('list:update', window.todo.data);
});

window.todo.on('delete-todo', function(e) {
  window.todo.data.todos.splice(e.index.i, 1);
  socket.emit('list:update', window.todo.data);
});

window.todo.on('done-editing-todo', function(e) {
  window.todo.set(e.keypath + '.text', e.node.value);
  window.todo.set(e.keypath + '.editing', false);
  // update!
  socket.emit('list:update', window.todo.data);
});


// This is a little busted and turns out to be a necessary addition to
// window.todo.on('sort-items', function (event) {
//   if (event.move) event.move();
//   //TODO: Figure out why the data is coming back all funky...
//   //I'm using my function above to recalculate the array order.
//   //I think that's what's making things weird...
//   //I'm using event.target as the original index and the event.current as the new index.
//   window.todo.set('todos', rearrange(window.todo.data.todos, $(event.target).index(), $(event.current).index()));
//   socket.emit('list:update', window.todo.data);
// });

//Jut need to rebind this. Kyle: can you work this into something
//that fits the module better?
function bindSortable(){
  $('[data-sortable]').sortable().bind('sortupdate', function(e, ui) {
    window.todo.set('todos', rearrange(window.todo.data.todos, ui.item.index(), ui.oldindex));
    socket.emit('list:update', window.todo.data);
  });
};
bindSortable()

socket.on('list:update', function(data) {
  window.todo.set('name', data.name);
  window.todo.set('todos', data.todos);
  bindSortable();
});
