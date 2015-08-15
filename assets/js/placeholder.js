var i = document.createElement('input');
var html5 = 'placeholder' in i;
$(document).ready(function(){
  if(!html5){
    $('input[type=text], input[type=email], input[type=tel], input[type=url], input[type=password], textarea').each(function(){
      if($(this).attr('placeholder'))
        $(this).val($(this).attr('placeholder')).addClass('ie9-placeholder');
    });
    $('input[type=text], input[type=email], input[type=tel], input[type=url], input[type=password], textarea').bind('click focus', function(){
      if($(this).attr('placeholder') && $(this).attr('placeholder') == $(this).val())
        $(this).val(null).removeClass('ie9-placeholder');
    });
    $('input[type=text], input[type=email], input[type=tel], input[type=url], input[type=password], textarea').bind('blur', function(){
      if($(this).attr('placeholder') && $.trim($(this).val()).length == 0)
        $(this).val($(this).attr('placeholder')).addClass('ie9-placeholder');
    });
  }
});