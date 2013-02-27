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
    // Creates the article
    $(page).find('#headline').html(articleData[index].title); //.html removes the weird &#038 from headlines
    var descr = $('<div />').html(articleData[index].content);
    var img = descr.find('img');
    img.css('width', '100%'); //Adjusts images to 100% width
    $(page).find('#image').replaceWith(img);
    $(page).find('#story').append(descr);

    //iPhones don't handle URLS in the description, this will ensure they work
    $(page).find('#story a').click(function (e) {
      e.preventDefault();
      cards.browser.open(this.href);
    });

    // Tapping headline and image goes to full article on perezhilton.com
    $(page).find('#headline').clickable().on('click', function (){
      cards.browser.open(articleData[index].link); 
    });
    $(img).clickable().on('click', function () {
      cards.browser.open(articleData[index].link); 
    });

    // If on the first article in the list, remove "Back" button
    if (articleData[index].index === 0){
      $(page).find('#Back').remove(); 
    }

    //If at the 10th article "Next" becomes "Go Home" and returns to article 0
    var length = articleData.length; 
    var len = length - 1;
    if (articleData[index].index === len){
      $(page).find('#Next').text('Home');    
      $(page).find('#Next').on('click', function () {
        index=0;
        App.load('Perez1', articleData[index]);
      });
    }

    else{
      // Go to the next article
      $(page).find('#Next').on('click', function () {
        index++;
        console.log(index);
        App.load('Perez1', articleData[index]);
      });
      //Handle "back"
      $(page).find('#Back').on('click', function () {
        //This will automatically go to the previous page if "back" is clicked
      });
    }

    // Send the article via Kik
    $(page).find('#kik-it').on('click', function () {
      //.html removes the weird &#038 from headlines, but needs to be a string so text
      var betterTitle = $('<div />').html(articleData[index].title).text();
      //Similarily need to removing the HTML from the brief description
      var brief = articleData[index].description;
      var foobar = $('<div />').html(brief);
      var summary = foobar.find('p').text() || brief;
      //Change the img to the img URL
      var imgURL = img.attr('src');
      var x = JSON.stringify(articleData[index]);

      cards.kik.send({
        title    : betterTitle                     ,
        text     : summary                         ,
        pic      : imgURL                          ,
        big      : false                           , 
        linkData : x 
      });
    });
  }
});

// Perez Viewer
// If opened from a Kik message the article may not be in the top 10
// This should not depend on index for positioning
App.populator('PerezViewer', function (page, linkData) {
  //Create the article
  $(page).find('#headline').html(linkData.title);
  var descr = $('<div />').html(linkData.content);
  var img = descr.find('img');
  img.css('width', '100%');  //Adjusts images to 100% width
  $(page).find('#image').replaceWith(img);
  $(page).find('#story').append(descr);

  //No back button, since it may no longer be in the stack... but you can go home
  $(page).find('#home').on('click', function () {
    index=0;
    App.load('Perez1', articleData[index]);
  });

  $(page).find('#headline').clickable().on('click', function () {
    cards.browser.open(linkData.link); 
  });
  $(img).clickable().on('click', function () {
    cards.browser.open(articleData[index].link); 
  });

  // Send the article via Kik again
  $(page).find('#kik-it').on('click', function () {
    var betterTitle = $('<div />').html(linkData.title).text();
    var brief = linkData.description;
    var foobar = $('<div />').html(brief); //Removing the HTML from the brief description
    var summary = foobar.find('p').text() || brief;
    var imgURL2 = img.attr('src');
    var y = JSON.stringify(linkData);

    cards.kik.send({
      title    : betterTitle                     ,
      text     : summary                         ,
      pic      : imgURL2                         ,
      big      : false                           , 
      linkData : y
    });
  });
});

// If opened from a card open the "PerezViewer"
if (cards.browser && cards.browser.linkData) {
  // Card was launched by a conversation
  App.load('PerezViewer', cards.browser.linkData);
}
//Otherwise use the list of articles
else {
  App.load('Perez1', articleData[0]);
}