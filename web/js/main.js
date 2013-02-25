App.populator('Perez1', function (page, articleData) {
  var i=1;
  var article = articleData[i];
  $(page).find('headline').clickable(); 
  $(page).find('#headline').text(article.head);
  $(page).find('#description').text(article.brief);

  var imgs= new Image();
  imgs.src = article.img;
  $(page).find('#image').replaceWith(imgs);


  // Send a Kik message
  $(page).find('#kik-it').on('click', function () {
    cards.kik.send({
        title    : 'Message title'        ,
        text     : 'Message body'         ,
        pic      : imgs.src             ,
        big      : true                   ,       
    });
  });

  // Tapping headline/image goes to full article on perezhilton.com
  $(page).find('#headline').on('click', function () {
    cards.browser.open(article.link); 
  });

  $(page).find('#myImage').on('click', function () {
    // Go to full article on perezhilton.com
    cards.browser.open(article.link); 
  });

  // Go to the "Next" page
  $(page).find('#Next').on('click', function () {
    // Go to next article
    i++;
    App.load('Perez1', articleData[i]);
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