// Defining some global variables
var articleData = [];
var index = 0;

function mod(a, b) {
  return ((a % b) + b) % b
}

App.populator('Perez1', function (page, article) {

  //Pull in content from PerezHilton.com
  feedParser.getArticles(function (articles){
    //console.log(articles);
    articleData = articles;
    index = articleData[index].index; 
    addContent();
  });

  var addContent = function () {
    var wrapper = page.querySelector('.wrapper');

    var slideviewer = new SlideViewer(wrapper, source, {
      startAt: parseInt(articleData[index].index, 10),
    });

    page.addEventListener('appLayout', function () {
      slideviewer.refreshSize();
    })

    //Adding the Home button if you are on the last item in the list
    slideviewer.on('flip', function(i){
      if (i===(articleData.length - 1)){
        console.log('testing');
        var home = $('<div />');
        home.addClass('app-button left');
        home.text('Home');
        $(page).find('.app-topbar').append(home);

        home.clickable().on('click', function (){
          slideviewer.setPage(0);
        });
      }
      else{
        $(page).find('.app-topbar .app-button.left').remove();
      }

    })

    function source(i) {
      var article = $('<div />');
      article.css('height', '100%');

      var articleSection = $('<div />');
      articleSection.addClass('app-section');
      articleSection.css('padding', 10);

      //* Article Heading Section
      var heading = $('<h2 />');
      var head = $('<div />').html(articleData[i].title);
      heading.text(head.text());
      heading.clickable().on('click', function (){
             cards.browser.open(articleData[i].link); 
      });
      articleSection.append(heading);

      //* Article Description Section including the Image
      var content = $('<p />');
      var descr = $('<div />').html(articleData[i].content);
      descr.find('img').clickable().on('click', function (){
            cards.browser.open(articleData[i].link); 
      });
      //If an article does not have an image set a default one
      //console.log(descr.find('img').length);
      if (descr.find('img').length === 0){
        var img = $('<img />');
        img.src('img/perez.png');
        articleSection.append(img);
      }
      content.append(descr);

      //Actually append all the article elements
      articleSection.append(content);
      article.append(articleSection);

      article.scrollable();

      return article[0];
    }
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