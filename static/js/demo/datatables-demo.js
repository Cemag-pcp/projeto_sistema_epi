// Call the dataTables jQuery plugin
$(document).ready(function() {
  $('#dataTable').DataTable();
});

$(document).ready(function() {
  $('#dataTable_entregas').DataTable({
    "info":false,
    "aLengthMenu":[4,10],
    "iDisplayLength":4,
    order: [[3, 'asc']]
  });
});

