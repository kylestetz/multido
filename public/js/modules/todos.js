// This file has the Todo class which manages its view
// and any relevant events from the server.
// usage: new Todo(dataFromServer);

function rearrange(array, fromIndex, toIndex) {
  array.splice(toIndex, 0, array.splice(fromIndex, 1)[0] );
  return array;
}

var todoTemplate = $('#todo-template').html();

function Todo(data) {
  var self = this;

  self.todo = new Ractive({
    el: '[data-md-contains="' + data._id + '"]',
    template: todoTemplate,
    data: data
  });

  // ====================================
  // EVENTS FROM THE VIEW
  // ====================================

  self.todo.on('check', function(e) {
    socket.emit('list:update', self.todo.data);
  });

  self.todo.on('add-todo', function(e) {
    self.todo.data.todos.push({ text: 'New Todo', checked: false });
    reloadSortable();
    socket.emit('list:update', self.todo.data);
  });

  self.todo.on('delete-todo', function(e) {
    self.todo.data.todos.splice(e.index.i, 1);
    reloadSortable();
    socket.emit('list:update', self.todo.data);
  });

  self.todo.on('edit-todo', function(e) {
    self.todo.set(e.keypath + '.editing', true);
    $getList().find('[data-md-todo-text-input]').focus().select();
  });

  self.todo.on('done-editing-todo', function(e) {
    self.todo.set(e.keypath + '.text', e.context.text);
    self.todo.set(e.keypath + '.editing', false);
    // update!
    socket.emit('list:update', self.todo.data);
  });

  self.todo.on('delete-list', function(e) {
    socket.emit('list:destroy', self.todo.data._id);
  });

  self.todo.on('name-change', function(e) {
    self.todo.set(e.keypath + '.name', e.node.innerHTML);
    socket.emit('list:update', self.todo.data);
    // stupid manual unfocus
    $('<div contenteditable="true"></div>').appendTo('body').focus().remove();
  });

  function bindSortable(){
    $getList()
      .sortable({
        items: '.md-todo:not(.empty)',
        connectWith: '.md-list-todos'
      })
      .bind('sortupdate', function(e, ui) {
        var oldIndex = ui.oldindex;
        if(ui.startparent[0] == ui.endparent[0]) {
          self.todo.set('todos', rearrange(self.todo.data.todos, ui.item.index(), ui.oldindex));
        } else {
          // two lists were involved!

          // take it out of the first list...
          var startListId = $(ui.startparent[0]).attr('data-md-list');
          var startList = window.todoManager.getList(startListId);
          var targetListId = $(ui.endparent[0]).attr('data-md-list');

          var indexInNewList = ui.item.index();

          // get the item and remove it from the startList todo array
          var dislodgedTodo = startList.todo.data.todos.splice(oldIndex, 1)[0];
          startList.todo.set('todos', startList.todo.data.todos);

          // and push it into the second list.
          self.todo.data.todos.splice(indexInNewList, 0, dislodgedTodo);
          self.todo.set('todos', self.todo.data.todos);

          socket.emit('list:update', startList.todo.data);
        }


        socket.emit('list:update', self.todo.data);

        // the sortable container persists, so we don't need to re-bind the
        // entire sortupdate method. we just need to tell the sortable
        // plugin to "reload", which will rebind its children for us.
        reloadSortable();
      })
    ;
  }

  function reloadSortable() {
    $getList().sortable('reload');
  }

  function $getList() {
    return $('[data-md-list="' + self.todo.data._id + '"]');
  }



  // ====================================
  // EVENTS FROM THE SERVER
  // ====================================

  socket.on('list:update', function(data) {
    // ignore todo updates that don't concern our dataset.
    if(self.todo.data._id == data._id) {
      self.todo.set('name', data.name);
      self.todo.set('todos', data.todos);
      reloadSortable();
    }
  });

  // ====================================
  // INITIALIZE
  // ====================================

  // init!
  bindSortable();
}

module.exports = Todo;
