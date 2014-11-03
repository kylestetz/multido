var Todo = require('./todos');

function TodoManager() {
  var self = this;
  self.$el = $('.todos');
  self.todos = [];

  // ====================================
  // EVENTS FROM THE SERVER
  // ====================================

  socket.on('list:create', function(todoData) {
    self.$el.append('<div class="todo-container" data-md-contains="' + todoData._id + '"></div>');
    self.todos.push( new Todo(todoData) );
    $('.md-list-add').attr('data-list-count', self.todos.length % 4);
  });

  socket.on('list:destroy', function(todoId) {
    self.remove(todoId);
    self.$el.find('[data-md-contains="' + todoId + '"]').remove();
    $('.md-list-add').attr('data-list-count', self.todos.length % 4);
  });

  socket.on('multido:update', function(data) {
    console.log('multido:update', data);
  });

  $('[data-add-list]').on('click', function(e) {
    socket.emit('list:create');
  });


  self.remove = function(todoId) {
    var index = null;
    for(var i = 0; i < self.todos.length; i++) {
      if(self.todos[i].todo.data._id == todoId) {
        index = i;
        break;
      }
    }
    if(index) {
      self.todos[index].todo.teardown();
      self.todos.splice(index, 1);
    }
  };


  // go no further if there isn't data to use.
  // multidos start with one blank todo, but if it's
  // deleted there might not be any. maybe we should
  // prevent the user from deleting the last todo list?
  if(!window.multido.lists.length) {
    return;
  }

  // ====================================
  // TODO MANAGEMENT INIT
  // ====================================

  window.multido.lists.forEach( function(todoData) {
    self.todos.push( new Todo(todoData) );
  });

}


window.todoManager = new TodoManager();
module.exports = {};
