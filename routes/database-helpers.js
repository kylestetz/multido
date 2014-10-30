var _ = require('lodash');
var randy = require('randy');

module.exports = function(db) {

  var multidos = db.collection('multidos');
  var lists    = db.collection('lists');

  var emptyMultido = { lists: [], name: 'New Multido' };
  var emptyList = {
    name: 'New List',
    todos: []
  };

  // GETTERS ------------------------------------------------

  function getMultido(id, callback) {
    multidos.findOne({ _id: id }, function(err, results) {
      if(err) throw err;
      return callback(err, results);
    });
  }

  function getLists(ids, callback) {
    if(!_.isArray(ids)) {
      ids = [ids];
    }
    lists.find({ _id: { $in: ids } }).toArray( function(err, results) {
      if(err) throw err;
      return callback(err, results);
    });
  }

  function getMultidoAndLists(multidoId, callback) {
    multidos.findOne({ _id: multidoId }, function(err, results) {
      if(err) throw err;

      if(results) {
        var multido = results;
        return getLists(multido.lists, function(err, lists) {
          if(err) throw err;

          multido.lists = lists;
          return callback(null, multido);
        });
      }

      else {
        console.error('Could not find multido with id ' + multidoId + '!');
        return callback({ error: 'could not find multido'});
      }
    });
  }

  // MAKERS AND TAKERS ------------------------------------------------

  function createMultido(callback) {
    var newMultido = _.clone(emptyMultido);
    newMultido._id = rando(6);
    multidos.insert(newMultido, { w: 1 }, function(err, multido) {
      if(err) {
        console.error(err);
        return callback(err);
      }

      createListInMultido(newMultido._id, function(err, newList) {
        newMultido.lists = newList;
        return callback(err, newMultido);
      });
    });
  }

  function createListInMultido(multidoId, callback) {
    var newEmptyList = _.clone(emptyList);
    newEmptyList._id = rando(16);
    lists.insert(newEmptyList, function(err, lists) {
      if(err) throw err;

      // update the multido to contain a reference to this list
      multidos.update({ _id: multidoId }, { $push: { lists: newEmptyList._id } }, function(err, multido) {
        if(err) throw err;
        return callback(err, newEmptyList);
      });
    });
  }

  function removeListInMultido(multidoId, listId, callback) {
    lists.remove({ _id: listId }, function(err) {
      if(err) throw err;

      // update the multido to remove the reference to this list
      multidos.update({ _id: multidoId }, { $pull: { lists: listId } }, function(err, multidos) {
        if(err) throw err;

        return callback(err);
      });
    });
  }

  // UPDATERS ------------------------------------------------

  function updateList(list, callback) {
    lists.update({ _id: list._id }, list, function(err) {
      if(err) throw err;

      return callback(err, list);
    });
  }

  function updateMultido(multido, callback) {
    lists.update({ _id: multido._id }, multido, function(err) {
      if(err) throw err;

      return callback(err, multido);
    });
  }

  // API ------------------------------------------------

  return {
    getMultido: getMultido,
    getLists: getLists,
    getMultidoAndLists: getMultidoAndLists,
    createMultido: createMultido,
    createListInMultido: createListInMultido,
    removeListInMultido: removeListInMultido,
    updateList: updateList
  };
};

function rando(length) {
  var id = '';
  var i = 0;
  for(i; i < (length || 6); i++) {
    if( randy.choice([true, false]) ) {
      id += randy.randInt(0, 9);
    } else {
      id += String.fromCharCode(randy.choice([97, 65]) + randy.randInt(0, 26));
    }
  }
  return id;
}