// ====================================
// ANY SPECIAL UI INTERACTIONS
// ====================================
$(function(){
  $('.md-list-add').hover(function() {
    $('.pre-footer').addClass('shift');
  }, function(){
    $('.pre-footer').removeClass('shift');
  });
});
