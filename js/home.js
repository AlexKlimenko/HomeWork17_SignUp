(function($) {
  const logoutBtn = $('.logout-btn');

  logoutBtn.on('click', function(e) {
    localStorage.removeItem('myapp_id');
    localStorage.removeItem('myapp_token');
    window.location = 'index.html';
  });
})(jQuery);

// 