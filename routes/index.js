var assets = require('./assets');

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
      // reverse the list so it's in the correct rendering order
      multido.lists.reverse();
      return res.render('multido.html', { multido: multido, assets: assets.getAssets() });
    });
  });

  // websockets!
  io.on('connection', function(socket) {

    var multidoId = '';

    // join a room specific to this multido to
    // prevent catching unrelated socket events.
    socket.on('multido:join', function(data) {
      multidoId = data.multidoId;
      socket.join(multidoId);
    });

    // create a new list
    socket.on('list:create', function(data){
      multiBase.createListInMultido(multidoId, function(err, list) {
        io.to(multidoId).emit('list:create', list);
      });
    });

    // update an existing list (sends the entire list)
    socket.on('list:update', function(list){
      multiBase.updateList(list, function(err, list) {
        socket.broadcast.to(multidoId).emit('list:update', list);
      });
    });

    // destroy a list
    socket.on('list:destroy', function(listId){
      multiBase.removeListInMultido(multidoId, listId, function() {
        // confirm destruction.
        io.to(multidoId).emit('list:destroy', listId);
      });
    });

    // change the multido's metadata
    socket.on('multido:update', function(multido){
      multiBase.updateMultido( function(err, multido) {
        socket.broadcast.to(multidoId).emit('multido:update', multido);
      });
    });
  });

  app.use(function(req, res, next){
    res.redirect('/');
  });

};