// Defining some global variables
var articleData = [];
var index = 0;

App.populator('Perez1', function (page, article) {

  //Pull in content from PerezHilton.com and create an array of articles
  feedParser.getArticles(function (articles){
    console.log(articles);
    articleData = articles;
    index = articleData[index].index; 
    addContent();
  });
  var addContent = function () {
    doStuff(0); //Since on('flip') isn't thrown initially
    var wrapper = page.querySelector('.wrapper');
    //Create a slidview
    wrapper.innerHTML='';
    var slideviewer = new SlideViewer(wrapper, source, {
      startAt: parseInt(articleData[index].index, 10),
    });
    page.addEventListener('appLayout', function () {
      slideviewer.refreshSize();
    })

    //* Adding the send Kik button
    $(page).find('#kik').on('click', function (){
      var j = slideviewer.page(); //index to current page not i
      var kikTitle = $('<div />').html(articleData[j].title).text();
      var kikDescription = $('<div />').html(articleData[j].description).text();
      var kikImg = $('<div />').html(articleData[j].content).find('img').attr('src');
      var kikLinkData = JSON.stringify(articleData[j]);

      cards.kik.send({
              title    : kikTitle                        ,
              text     : kikDescription                  ,
              pic      : kikImg                          ,
              big      : false                           , 
              linkData : kikLinkData
            });
    });

    //* Adding the 'Home' if you flip to the last page
    function doStuff(i){
      if (i===(articleData.length - 1)){
        var home = $('<div />');
        home.addClass('app-button left');
        //home.text('Home');
        $(page).find('.app-topbar').append(home);
        home.on('click', function (){
          slideviewer.setPage(0);
        });
      }
      else{
        $(page).find('.app-topbar .app-button.left').remove();
      }
    }
    slideviewer.on('flip', function(i){
      doStuff(i);
    });

    //* For real adds the content
    function source(i) {
      var article = $('<div />');
      article.css('height', '100%');

      var articleSection = $('<div />');
      articleSection.addClass('app-section');

      //* Article Heading Section
      var heading = $('<h2 />');
      var head = $('<div />').html(articleData[i].title);
      heading.text(head.text());
      heading.clickable().on('click', function (){
             cards.browser.open(articleData[i].link); 
      });
      heading.css('padding',10);
      articleSection.append(heading);

      //* Article Description Section including the Image
      //var content = $('<p />');
      var descr = $('<div />').html(articleData[i].content);
      descr.find('img').clickable().on('click', function (){
            cards.browser.open(articleData[i].link); 
      });
      //Finds all the 'children' <p> in the description without an image, adds padding to the text
      descr.children().each(function(i, descrChild){
        if ($(this).find('img').length ===0){
          $(this).css('padding',10);
        }
        //Add default image to articles that have no images
        if ($(this).find('span').length){
          var imgs = new Image();
          imgs.src = 'img/perez.jpg';
          $(this).find('span').replaceWith(imgs);
        }
        //Scale the Embedded YouTube video to fit the page
        if ($(this).find('iframe').length){
          console.log('testing');
          $(this).find('iframe').width('100%');
          $(this).find('iframe').height('56%')

        }
      });
      articleSection.append(descr);

      //Actually append all the article elements
      article.append(articleSection);
      article.scrollable();
      return article[0];
    }
  }
},  function (page, article) {// Destructor for Perez

});

function handleBackButton () {
  if (cards.kik.returnToConversation) {
      // Card was launched by a conversation
      cards.kik.returnToConversation(); // return to conversation
  }
  else{
    return false
  };
}

// fromKikPerez Viewer
// If opened from a Kik message the article may not be in the top 10
// This should not depend on index for positioning
App.populator('fromKikPerez', function (page, linkData) {
  // If on android and opening from a Kik message, handle the back button
  var os = cards.utils.platform.os;
  if (os.name === 'android'){
    cards.browser.back(handleBackButton);  
  }

  //Create the same UI as the slide viewer page
  $(page).find('#headline').html(linkData.title);
  var descr = $('<div />').html(linkData.content);
  var img = descr.find('img');
  img.css('width', '100%');  //Adjusts images to 100% width
  $(page).find('#image').replaceWith(img);
  $(page).find('#story').append(descr);
  $(page).find('#headline').clickable().on('click', function () {
    cards.browser.open(linkData.link); 
  });
  $(img).clickable().on('click', function () {
    cards.browser.open(articleData[index].link); 
  });

  //Since opened from a Kik, no slide viewer, thus force user to go 'Home'
  $(page).find('#home').on('click', function () {
    index=0;
    App.load('Perez1', articleData[index], function () {//This is a callback:)
      //When done loading new PErez1, remove from the backstack
      try {
        App.removeFromStack(0);
      }
      catch (err) {}
    });
  });

  //Able to send article via Kik again
  $(page).find('#kik').on('click', function () {
    var fromKikTitle = $('<div />').html(linkData.title).text();
    var fromKikDescription = $('<div />').html(linkData.description).text();
    var fromKikImg = $('<div />').html(linkData.content).find('img').attr('src');
    var fromKikLinkData = JSON.stringify(linkData);

    cards.kik.send({
      title    : fromKikTitle                    ,
      text     : fromKikDescription              ,
      pic      : fromKikImg                      ,
      big      : false                           , 
      linkData : fromKikLinkData
    });
  });
}, function(page, linkData){ //Destructor for the fromKikPerez Populator
    var os = cards.utils.platform.os;
    if (os.name === 'android'){
      cards.browser.unbindBack(handleBackButton);
    }
});


// If opened from a card open the "PerezViewer"
if (cards.browser && cards.browser.linkData) {
  // Card was launched by a conversation
  App.load('fromKikPerez', cards.browser.linkData);
}
//Otherwise use the list of articles
else {
  App.load('Perez1', articleData[0]);
}