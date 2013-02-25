App.populator('Perez1', function (page, articleData) {
  //for (var i=0; i<=2; i++) {
  var i=0;
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

  $(imgs).on('click', function () {
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
    head: 'Taylor Swift Dating Brit Award Winner Tom Odell!? See PICS Of Their First Night Together HERE!',
    img: 'img/p1.jpg',
    brief: 'Hold on to your hat, Harry Styles — the man-eating Princess of Pop is hungry for a new young British boy! Taylor Swift was seen at Groucho Club in London Thursday night with Britains rising star, Tom Odell! The two even got tipsy at an authentic English pub beforehand! Swifty dazzled on stage yesterday, but this snagging this guy was her most impressive move of the week! She didnt win a Brit Award… So she took home the 22-year-old singer-songwriter who did! HA! Tom won the Critics Choice award last night and, judging by how cozy these two looked together, he mightve gotten even luckier later on in the evening!! We shouldve known these two were trouble when they walked in getting together after his ah-mazing rendition of her smash single went viral!',
    link: 'http://perezhilton.com/2013-02-21-taylor-swift-tom-odell-dating-sighting-london-pub-brit-awards-harry-styles-one-direction/?from=topstory_perezhilton',
  },
  {
    head: 'Headline2',
    img: 'img/p2.jpg',
    brief: 'Description for headline2',
    link: 'http://www.perezhilton.com/',
  },
  {
    head: 'Headline3',
    img: 'img/p3.jpg',
    brief: 'Description for headline3',
    link: 'http://www.perezhilton.com/',
  }
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