$('[data-add-list]').on('click', function(e) {
  $.post('/new', function(data) {
    window.location.href = '/list/' + data._id;
  });
});