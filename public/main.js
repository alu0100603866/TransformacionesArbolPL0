$(document).ready(function() {
  $('#parse').click(function() {
    try {
      var result = pl0.parse($('#input').val());
      var processed = treeTransform(result);
      $('#output').html(JSON.stringify(processed,undefined,2));
     
    
    } catch (e) {
      $('#output').html('<div class="error"><pre>\n' + String(e) + '\n</pre></div>');
    }
  });

  $("#examples").change(function(ev) {
    var f = ev.target.files[0]; 
    var r = new FileReader();
    r.onload = function(e) { 
      var contents = e.target.result;
      
      input.innerHTML = contents;
    }
    r.readAsText(f);
  });
  
  
  $('#saveButton').click(function() {
     if ($("#saveas").val().length > 0)
       $( "#formsave" ).submit();
      else
       alert("Debes dar un nombre al fichero");
    
  });
});
