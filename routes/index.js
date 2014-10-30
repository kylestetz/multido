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
    multiBase.createMultido( function(multido) {
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
      return res.render('multido.html', { multido: multido });
    });
  });

  // websockets!
  io.on('connection', function(socket) {

    socket.on('list:update', function(list){
      console.log('list:update');
    });

    socket.on('list:create', function(data){
      var multidoId = data.multidoId;
      multiBase.createListInMultido(multidoId, function(list) {
        socket.broadcast.emit('list:update', list);
      });
    });

    // title change
    socket.on('multido:update', function(){
      console.log('multido:update');
    });

  });

  app.use(function(req, res, next){
    res.redirect('/');
  });

};