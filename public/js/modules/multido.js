// this is JS specific to the homepage.

$('[data-add-multido]').on('click', function(e) {
  $.post('/new', function(data) {
    window.location.href = '/list/' + data._id;
  });
});