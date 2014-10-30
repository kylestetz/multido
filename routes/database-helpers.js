var _ = require('lodash');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var ObjectId = BSON.ObjectID;

module.exports = function(db) {

  var multidos = db.collection('multidos');
  var lists    = db.collection('lists');

  var emptyMultido = { lists: [], name: '' };
  var emptyList = {
    name: 'Kyle',
    todos: []
  };

  // GETTERS ------------------------------------------------

  function getMultido(id, callback) {
    multidos.findOne({ _id: new ObjectId(id) }, function(err, results) {
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
    multidos.findOne({ _id: new ObjectId(multidoId) }, function(err, results) {
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
    multidos.insert(emptyMultido, { w: 1 }, function(err, multido) {
      if(err) throw err;

      return callback(multido[0]);
    });
  }

  function createListInMultido(multidoId, callback) {
    lists.insert(emptyList, function(err, lists) {
      if(err) throw err;
      var newList = lists[0];

      // update the multido to contain a reference to this list
      multidos.update({ _id: new ObjectId(multidoId) }, { $push: { lists: newList._id } }, function(err, multido) {
        if(err) throw err;

        return callback(newList);
      });
    });
  }

  function removeListInMultido(multidoId, listId, callback) {
    lists.remove({ _id: listId }, function(err) {
      if(err) throw err;

      // update the multido to remove the reference to this list
      multidos.update({ _id: new ObjectId(multidoId) }, { $pull: { lists: listId } }, function(err, multidos) {
        if(err) throw err;

        return callback(err);
      });
    });
  }

  // UPDATERS ------------------------------------------------

  function updateList(multidoId, list, callback) {
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