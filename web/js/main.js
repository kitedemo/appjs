// Defining some global variables
var articleData = [];
var index = 0;

App.populator('Perez1', function (page, article) {

  //Pull in content from PerezHilton.com
  feedParser.getArticles(function (articles){
    articleData = articles;
    index = articleData[index].index; 
    addContent();
  });

  var addContent = function () {
    $(page).find('#headline').clickable(); 
    $(page).find('#headline').text(articleData[index].title);
    $(page).find('#story').append(articleData[index].content);
  
    // Replacing the default image with the article image
    // var imgs = new Image();
    // imgs.src = article.img;
    // $(page).find('#image').replaceWith(imgs);

    // Tapping headline goes to full article on perezhilton.com
    $(page).find('#headline').on('click', function () {
      cards.browser.open(articleData[index].link); 
    });

    // Tapping image also goes to full article on perezhilton.com
    // $(imgs).on('click', function () {
    //   cards.browser.open(articleData[index].link); 
    // });

    // If on the first article in the list, remove "Back" button
    if (articleData[index].index === 0){
      $(page).find('#Back').remove(); 
    }

    //If at the 10th article "Next" becomes "Go Home" returns to article 0
    var length = articleData.length; 
    var len = length - 1;
    if (articleData[index].index === len){
      $(page).find('#Next').remove(); 
      $(page).find('#Back').replaceWith('<div class="app-button" id="home">New Stories</div>');
      
      index = 0;
      $(page).find('#home').on('click', function () {
        App.load('Perez1', articleData[index]);
      });
    }

    else{
      // Otherwise go to the next article
      $(page).find('#Next').on('click', function () {
        index++;
        console.log(index);
        App.load('Perez1', articleData[index]);
      });

      //Otherwise handle "back"
      $(page).find('#Back').on('click', function () {
        //This will automatically go to the previous page if "back" is clicked
      });
    }

    // Send the article via Kik
    $(page).find('#kik-it').on('click', function () {
      //Removing the HTML from the brief description
      var brief = articleData[index].description;
      var foobar = $('<div />').html(brief);
      var summary = foobar.find('p').text() || brief;

      var x = JSON.stringify(articleData[index]);

      cards.kik.send({
        title    : articleData[index].title        ,
        text     : summary                         ,
        pic      : 'img/perez.jpg'                 ,
        big      : false                           , 
        linkData : x 
      });
    });
  }
});

// For the future "preview" page
App.populator('PerezViewer', function (page, linkData) {
  //App.load('Perez1', articleData);
  $(page).find('#headline').clickable(); 
  $(page).find('#headline').text(linkData.title);
  $(page).find('#story').append(linkData.content);

  index=0;
  $(page).find('#home').on('click', function () {
    App.load('Perez1', articleData[0]);
  });

  // Tapping headline goes to full article on perezhilton.com
  $(page).find('#headline').on('click', function () {
    cards.browser.open(articleData[index].link); 
  });

  // Send the article via Kik
  $(page).find('#kik-it').on('click', function () {
    //Removing the HTML from the brief description
    var brief = linkData.description;
    var foobar = $('<div />').html(brief);
    var summary = foobar.find('p').text() || brief;

    var y = JSON.stringify(linkData);

    cards.kik.send({
      title    : linkData.title        ,
      text     : summary                         ,
      pic      : 'img/perez.jpg'                 ,
      big      : false                           , 
      linkData : y
    });
  });

});

if (cards.browser && cards.browser.linkData) {
  // Card was launched by a conversation
  //var articleData = JSON.parse(cards.browser.linkData);
  App.load('PerezViewer', cards.browser.linkData);

}else {
  App.load('Perez1', articleData[0]);
}