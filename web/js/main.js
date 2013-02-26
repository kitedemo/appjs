
App.populator('Perez1', function (page, article) {

  //Pull in content from PerezHilton.com
  feedParser.getArticles(function (articles){
    console.log(articles);
    articleData = articles;
    index = articleData[index].index; 
    addContent();
  });

  var addContent = function () {
    $(page).find('headline').clickable(); 
    $(page).find('#headline').text(articleData[index].title);
    $(page).find('#story').append(articleData[index].content);
  
    // Replacing the default image with the article image
    // var imgs = new Image();
    // imgs.src = article.img;
    // $(page).find('#image').replaceWith(imgs);

    // Send the article via Kik
    $(page).find('#kik-it').on('click', function () {
      cards.kik.send({
          title    : articleData[index].title        ,
          text     : articleData[index].content       ,
          pic      : 'img/p1.jpg'               ,
          big      : false                   ,       
      });
    });

    // Tapping headline goes to full article on perezhilton.com
    $(page).find('#headline').on('click', function () {
      cards.browser.open(articleData[index].link); 
    });

    // Tapping image also goes to full article on perezhilton.com
    // $(imgs).on('click', function () {
    //   cards.browser.open(articleData[index].link); 
    // });

    // Add the "Back" button if it isn't the first article in the list
    if (articleData[index].index !== 0){
      $(page).find('#title').append('<div class="app-button left" id="Back" data-back="true">Back</div>'); 

      //ASK JAIRAJ WHY THIS DOESN'T WORK should be data-back
      $(page).find('#Back').on('click', function () {
        //This will automatically go to the previous page if "back" is clicked
        console.log('test');
      });
    }
    //If at the 10th article "Next" becomes "Go Home"
    var length = articleData.length; 
    var len = length - 1;
    if (articleData[index].index === len){
      $(page).find('#Next').replaceWith('<div class="app-button" id="home">Back to First Story</div>');
      
      $(page).find('#home').on('click', function () {
        index=0;
        App.load('Perez1', articleData[index]);
      });
    }

    // Otherwise go to the next article
    else{
      $(page).find('#Next').on('click', function () {
        index++;
        App.load('Perez1', articleData[index]);
    });
    }
  }
});

// Defining some global variables
var articleData = [];
var index = 0;

// First app.load
App.load('Perez1', articleData[0]);

// For the future "preview" page
App.populator('PerezPreview', function (page, articleData) {
  //App.load('Perez1', articleData);
});

try {
  App.restore();
}
catch (err) {
  //App.load('home');
}