// Global Variables
var articleData = [];
var index = 0;

App.populator('Perez1', function (page, article) {
  // Once the card is ready - not blocking DOM Load, pull content from PerezHilton.com 
  // Create an array of article objects
  cards.ready(function () {
    feedParser.getArticles(function (articles){
      //console.log(articles);
      // If articles exist/we can fetch them, stores a set of articles for offline mode
      if (articles){
        Store.set('articles', articles);
      }
      else{
        //If we can't fetch articles/DNE,  then we should retrieve them from the cache
        articles = Store.get('articles');
      }
      // TO DO: Why can't this be above? 
      if (articles){
        articleData = articles;
        index = articleData[index].index;  
        addContent();
      }
     else {
      // TO DO: Add network error state here
     }
    }).error(function(){
      //Went to db but couldn't get articles from it, so serve cached articles 
      var articles = Store.get('articles');
      if (articles){
        articleData = articles;
       index = articleData[index].index;  
       addContent();
     }
      else{
        //TO DO: Add network error state here
     }
    });
  });

  // // Add Dot Carousel
  // // Note: this used to be not hardcoded but transitioning to the loading screen 
  // // looked awful so changed to hardcoding outside of addContent
  // for (var d=0;d<10;d++){
  //   var newDot= $('<div />');
  //   newDot.addClass('dot');
  //   $(page).find('#dots').append(newDot);
  // }

  // Add Article Content - Title, Pic, Description
  function addContent () {
    //Since on('flip') isn't thrown initially for page0
    // addDot(0);
    
    // Add "Reload" button
    var reload = $('<div />');
    reload.addClass('app-button reload');
    $(page).find('.app-topbar').append(reload);
    reload.clickable().on('click', function (){
      //Reload to the first article with a slide right transition
      index=0;
      App.load('Perez1', articleData[index], 'slide-right', function () { //This is a callback:)
        //When done loading new Perez1, remove from the backstack
        try {
          App.removeFromStack(0);
        }
        catch (err) {}
      });
    });

    var wrapper = page.querySelector('.wrapper');
    wrapper.innerHTML=''; //Tears down the wrapper to remove default spinner state
    
    //Create Slideview
    var slideviewer = new SlideViewer(wrapper, source, {
      startAt: parseInt(articleData[index].index, 30),
    });
    page.addEventListener('appLayout', function () {
      slideviewer.refreshSize();
    })

    // //Add Active Dot for the page your on
    // function addDot(i){
    //   $(page).find('#dots .dot.active').removeClass('active'); //Removes all active dots
    //   var current = $(page).find('#dots .dot').eq(i);
    //   current.addClass('active'); //Sets the active dot to the current page
    // }

    //* Adding the article for sending via Kik
    $(page).find('#kik').on('click', function (){
     var j = slideviewer.page(); //index to current page not i
     var kikTitle = $('<div />').html(articleData[j].title).text();
     var kikDescription = $('<div />').html(articleData[j].description).text();
     var kikImg = $('<div />').html(articleData[j].content).find('img').attr('src');
     var kikLinkData = JSON.stringify(articleData[j]);

      cards.kik.send({
        title    : kikTitle,
        text     : kikDescription,
        pic      : kikImg,
        big      : false, 
        linkData : kikLinkData
      });
    });

    // // Call these functions everytime your flip
    // slideviewer.on('flip', function(i){
    //   addDot(i);
    // });

    // Creates the content page
    function source(i) {
      var article = $('<div />');
      article.css('height', '100%');

      var articleSection = $('<div />');
      articleSection.addClass('app-section');

      //* Article Heading Section
      var heading = $('<h2 />');
      var head = $('<div />').html(articleData[i].title); //Need HTML to remove 'escape entities'
      heading.text(head.text());
      heading.clickable().on('click', function (){
        cards.browser.open(articleData[i].link); //Click the headline, open article URL
      });
      heading.css('padding',10);
      articleSection.append(heading);

      //* Article Description Section including the Image
      var descr = $('<div />').html(articleData[i].content);
      //Finds all the 'children' without an image (<p>) in the description, adds padding to the text
      descr.children().not(descr.children().has('img')).css('padding',10);

      //Adds default image to articles that have videos in <span> tags
      if (descr.find('span').length){
        var imgs = $('<img />');
        imgs.attr('src', 'img/pink_video.jpeg');
        imgs.addClass('centeredImage');
        descr.find('span').replaceWith(imgs);
        imgs.parent().css('text-align', 'center');
      }

      //Scale the Embedded YouTube video to fit the page
      descr.find('iframe').width('100%').height('56%');

      //Find all the poll articles and remove form, loading spinners and vote buttons
      descr.find('.wp-polls-loading').remove();
      descr.find('.wp-polls form').remove();
      descr.find('a[href$="#VotePoll"]').remove();

      //Find all the links in the description and override default click behaviour
      //Think of the bug on iPhone when it would fail to load the card after click
      descr.find('a').on('click', function(e){
        e.preventDefault();
        cards.browser.open($(this).attr("href"));
      }); 

      //Adds default image to articles
      if (descr.find('img').length === 0){
        var imgs = new Image();
        imgs.src = 'img/perez.jpg';
        $(descr).prepend(imgs);
      }
      
      // Once all the new images are added, update the content for the article
      articleData[i].content = descr.html();

      // For all images in description, make them clickable to the article
      descr.find('img').clickable().on('click', function (){
            cards.browser.open(articleData[i].link); //Click the image, open article URL
      });
      articleSection.append(descr);
      //Actually append all the article elements
      article.append(articleSection);

      if ( App.platform === 'android' && App.platformVersion >= 4 ) {
        // For Android > ICS touch events are eaten on some slide viewer pages
        // this should prevent that
        article.scrollable(true);  
      }
      else{
        article.scrollable();
      }
    return article[0];
    }
  }
}, function (page, article) {// Destructor for Perez
  var os = cards.utils.platform.os;
  if (os.name === 'android'){
    //Once you dismiss the fromKikPerez viewer we don't want to return to
    //the previous conversation, so need to unbindBack
    cards.browser.unbindBack(handleBackButton);
  }
});





// fromKikPerez Viewer
// If opened from a Kik message the article may not be in the top 10
// This should not depend on index for positioning
App.populator('fromKikPerez', function (page, linkData) {
  // If on Android and opening from a Kik message, handle the back button
  var os = cards.utils.platform.os;
  if (os.name === 'android'){
    cards.browser.back(handleBackButton);  
  }

  //* Same UI as the Perez slide viewer page
  $(page).find('#headline').html(linkData.title);
  var descr = $('<div />').html(linkData.content);
  $(page).find('#story').append(descr);
  $(page).find('#headline').clickable().on('click', function () {
    cards.browser.open(linkData.link); 
  });
  var img = descr.find('img');
  $(img).clickable().on('click', function () {
    cards.browser.open(articleData[index].link); 
  });

  //Since opened from a Kik, no slide viewer, thus force user to go 'Home'
  $(page).find('#home').on('click', function () {
    index=0;
    App.load('Perez1', articleData[index], 'slideoff-down', function () { //This is a callback:)
      //When done loading new Perez1, remove from the backstack
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
    if (App.platform === 'android'){
      //Once you dismiss the fromKikPerez viewer we don't want to return to
      //the previous conversation, so need to unbindBack
      cards.browser.unbindBack(handleBackButton);
    }
});

//* If opened on an Android device should handle the physical back button
function handleBackButton () {
  if (cards.kik.returnToConversation) {
      // Card was launched by a conversation, return to the Kik convo
      cards.kik.returnToConversation();
  }
  else{
    return false
  };
}

//Give a timeout for articles to fetch, if exceeds then get from cache
ZERVER_TIMEOUT = 15000;

// If opened from a Kik Message then open the "PerezViewer"
if (cards.browser && cards.browser.linkData) {
  // Card was launched by a conversation
  App.load('fromKikPerez', cards.browser.linkData);
}
//Otherwise use default Perez
else {
    App.load('Perez1', articleData[0]);
}