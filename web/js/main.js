
App.populator('Perez1', function (page, article) {
    $(page).find('headline').clickable(); 
    $(page).find('#headline').text(article.head);
    $(page).find('#description').text(article.brief);
    console.log(article['index']);
    // Replacing the default image with the article image
    var imgs = new Image();
    imgs.src = article.img;
    $(page).find('#image').replaceWith(imgs);

    // Send the article via Kik
    $(page).find('#kik-it').on('click', function () {
      cards.kik.send({
          title    : 'article.head'         ,
          text     : 'article.brief'        ,
          pic      : imgs.src               ,
          big      : true                   ,       
      });
    });

    // Tapping headline/image goes to full article on perezhilton.com
    $(page).find('#headline').on('click', function () {
      cards.browser.open(article.link); 
    });
    // Tapping image also goes to full article on perezhilton.com
    $(imgs).on('click', function () {
      cards.browser.open(article.link); 
    });

    //Check where you are in the page stack, if at the end "Next" becomes "Go Home"
    var length = articleData.length; 
    var len = length - 1;
    if (article['index'] == len){
      $(page).find('#Next').replaceWith('<div class="app-button" id="home">Back to First Story</div>');
      
      $(page).find('#home').on('click', function () {
        App.load('Perez1', articleData[0]);
      });
    }

    // Go to the "Next" article
   
      else{
        $(page).find('#Next').on('click', function () {
      App.load('Perez1', articleData[(article['index'] + 1)]);
      });
    }

    MyAPI.ping('hi', function(str) {
      console.log(str);
    });
});

var articleData = [
{
  index: 0,
  head: 'Taylor Swift Dating Brit Award Winner Tom Odell!? See PICS Of Their First Night Together HERE!',
  img: 'img/p1.jpg',
  brief: 'Hold on to your hat, Harry Styles — the man-eating Princess of Pop is hungry for a new young British boy! Taylor Swift was seen at Groucho Club in London Thursday night with Britains rising star, Tom Odell! The two even got tipsy at an authentic English pub beforehand! Swifty dazzled on stage yesterday, but this snagging this guy was her most impressive move of the week! She didnt win a Brit Award… So she took home the 22-year-old singer-songwriter who did! HA! Tom won the Critics Choice award last night and, judging by how cozy these two looked together, he mightve gotten even luckier later on in the evening!! We shouldve known these two were trouble when they walked in getting together after his ah-mazing rendition of her smash single went viral!',
  link: 'http://perezhilton.com/2013-02-21-taylor-swift-tom-odell-dating-sighting-london-pub-brit-awards-harry-styles-one-direction/?from=topstory_perezhilton',
},
{
  index: 1,
  head: 'Headline2',
  img: 'img/p2.jpg',
  brief: 'Description for headline2',
  link: 'http://www.perezhilton.com/',
},
{
  index: 2,
  head: 'Headline3',
  img: 'img/p3.jpg',
  brief: 'Description for headline3',
  link: 'http://www.perezhilton.com/',
}
];

App.load('Perez1', articleData[0]);

App.populator('Perez2', function (page, articleData) {
  App.load('Perez1', articleData);
});

try {
  App.restore();
}
catch (err) {
  //App.load('home');
}