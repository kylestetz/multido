// ====================================
// ANY SPECIAL UI INTERACTIONS
// ====================================
$(function(){
  $('.md-list-add').hover(function() {
    console.log("Hi!!!");
    $('.pre-footer').addClass('shift');
  }, function(){
    $('.pre-footer').removeClass('shift');
  });
});
