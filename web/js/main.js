App.populator('Perez1', function (page, articleData) {
  $(page).find('headline').clickable();
  $(page).find('#headline').text(articleData[0].head);
  $(page).find('#description').text(articleData[0].brief);

  var $images = articleData[1].img;
  var $newImage = $('<div class="image"></div>');
  $(page).find('#image').replaceWith($images);

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
    cards.browser.open('http://www.google.com'); 
  });

  $(page).find('#myImage').on('click', function () {
    // Go to full article on perezhilton.com
    cards.browser.open('http://perezhilton.com/2013-02-21-taylor-swift-tom-odell-dating-sighting-london-pub-brit-awards-harry-styles-one-direction/?from=topstory_perezhilton'); 
  });

  // Go to the "Next" page
  $(page).find('#Next').on('click', function () {
    // Go to next article
    App.load('Perez1', articleData[1]);
  });

});

var articleData = [
  {
    head: 'Headline1',
    img: 'img/p1.jpg',
    brief: 'Description for headline1',
    link: 'www.perezhilton.com/1',
  },
  {
    head: 'Headline2',
    img: 'img/p2.jpg',
    brief: 'Description for headline2',
    link: 'www.perezhilton.com/2',
  },
  {
    head: 'Headline3',
    img: 'img/p3.jpg',
    brief: 'Description for headline3',
    link: 'www.perezhilton.com/3',
  },
];
var images = ['img/p1.jpg', 'img/p2.png', 'img/p3.png'];

App.load('Perez1', articleData);

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