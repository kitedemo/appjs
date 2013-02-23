App.populator('Perez1', function (page, article) {
  $(page).find('headline').clickable();
  $(page).find('#headline').text(head[0]);
  $(page).find('#description').text(descr[0]);
  //$(page).find('#image').replaceWith(images[0]);

  // Send a Kik message
  $(page).find('#kik-it').on('click', function () {
    cards.kik.send({
        title    : 'Message title'        ,
        text     : 'Message body'         ,
        pic      : 'img/p1.jpg'            ,
        big      : true                   ,       
    });
  });

  // Tapping headline/image goes to full article on perezhilton.com
  $(page).find('#headline').on('click', function () {
    cards.browser.open('http://perezhilton.com/2013-02-21-taylor-swift-tom-odell-dating-sighting-london-pub-brit-awards-harry-styles-one-direction/?from=topstory_perezhilton'); 
  });
  $(page).find('#myImage').on('click', function () {
    // Go to full article on perezhilton.com
    cards.browser.open('http://perezhilton.com/2013-02-21-taylor-swift-tom-odell-dating-sighting-london-pub-brit-awards-harry-styles-one-direction/?from=topstory_perezhilton'); 
  });

  // Go to the "Next" page
  $(page).find('#Next').on('click', function () {
    // Go to next article
    App.load('Perez2', article);
  });

});

var head = ['Taylor Swift Dating Brit Award Winner Tom Odell!? See PICS Of Their First Night Together HERE!', 'h2', 'h3', 'h4', 'h5'];
var descr =['Hold on to your hat, Harry Styles -- the man-eating Princess of Pop is hungry for a new young British boy! Taylor Swift was seen at Groucho Club in London last night with Britains rising star, Tom Odell! The two even got tipsy at an authentic English pub beforehand!', 'd2', 'd3', 'd4', 'd5'];
var images = ['img/p1.jpg', 'img/p2.png', 'img/p3.png'];
var link = ['www.perezhilton.com']
var article;

App.load('Perez1', article);

App.populator('Perez2', function (page) {
  // put stuff here
  //$(page).find('#description' ).text(article.descript);
});

try {
  App.restore();
}
catch (err) {
  //App.load('home');
}