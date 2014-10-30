var assets = require('./assets');

/*

multido:
{
  lists: [ listIds ]
}

list:
{
  name: 'Kyle',
  todos: [
    {
      title: '',
      checked: '',
    }
  ]
}

*/

module.exports = function(app, io, db) {

  var multiBase = require('./database-helpers.js')(db);

  // homepage
  app.get('/', function(req, res) {
    return res.render('index.html', { assets: assets.getAssets() });
  });

  // make a new list
  app.post('/new', function(req, res) {
    multiBase.createMultido( function(err, multido) {
      // if we get an error, just have the frontend try again!
      if(err) {
        // 409 is "conflict"?? haha NEAT
        res.statusCode = 409;
        return res.json({ error: 'The database got confused. Try again!' });
      }
      // frontend should redirect to list/:id
      return res.json(multido);
    });
  });

  // go to a list
  app.get('/list/:id', function(req, res) {
    if(!req.params.id) {
      return res.redirect('/');
    }
    multiBase.getMultidoAndLists(req.params.id, function(err, multido) {
      return res.render('multido.html', { multido: multido, assets: assets.getAssets() });
    });
  });

  // websockets!
  io.on('connection', function(socket) {

    socket.on('list:create', function(data){
      var multidoId = data.multidoId;
      multiBase.createListInMultido(multidoId, function(err, list) {
        io.sockets.emit('list:create', list);
      });
    });

    socket.on('list:update', function(list){
      multiBase.updateList(list, function(err, list) {
        io.sockets.emit('list:update', list);
      });
    });

    socket.on('list:destroy', function(data){
      multiBase.removeListInMultido(data.multidoId, data.listId, function() {
        // confirm destruction.
        io.sockets.emit('list:destroy', data.listId);
      });
    });

    // title change
    socket.on('multido:update', function(multido){
      multiBase.updateMultido( function(err, multido) {
        io.sockets.emit('multido:update', multido);
      });
    });

  });

  app.use(function(req, res, next){
    res.redirect('/');
  });

};