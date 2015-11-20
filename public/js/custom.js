$(function(){

  var csrftoken = $('#csrf').val();

  $(document).on('click', "#apply", function(e){
    e.preventDefault();
    var url_id = $('#url_id').val();
    var content_id = $('#content_id').val();
    var content_type = $('#content_type').val();

    $.ajax({
      type: "POST",
      url: "/jobs/apply/" + url_id,
      data:{ _csrf: csrftoken},
      success: function(){
        var totalCandidates = parseInt($('#totalCandidates').html());
        totalCandidates += 1;
        $('#totalCandidates').html(totalCandidates);

        $('#apply').removeClass('btn-warning btn-danger').addClass('btn-success')
        .html('<span class="glyphicon glyphicon-ok"></span> Applied').attr('id', 'unapply');

      },
      error: function(data){
        alert('Error', data);
      }
    });
  });

  $(document).on('click', "#unapply", function(e){
    e.preventDefault();
    var url_id = $('#url_id').val();

    $.ajax({
      type: "POST",
      url: "/jobs/unapply/" + url_id,
      data:{ _csrf: csrftoken},
      success: function(){
        var totalCandidates = parseInt($('#totalCandidates').html());
        totalCandidates -= 1;
        $('#totalCandidates').html(totalCandidates);
        $('#unapply').removeClass('btn-success btn-danger').addClass('btn-warning').html('Apply').attr('id', 'apply');

      },
      error: function(data){
        alert('Error', data);
      }
    });
  });


  $(document).on('mouseenter', '#unapply', function(e) {
    $(this).removeClass('btn-success').addClass('btn-danger').html('<span class="glyphicon glyphicon-remove"></span> Unapply');
  });

  $(document).on('mouseleave', '#unapply', function(e) {
    $(this).removeClass('btn-danger').addClass('btn-success').html('<span class="glyphicon glyphicon-ok"></span> Applied');
  });



});
