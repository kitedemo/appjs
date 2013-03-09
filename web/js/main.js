// Global Variables
var articleData = [];
var index = 0;

App.populator('Perez1', function (page, article) {

  // Pull in content from PerezHilton.com and create an array of articles
  // But only do so once the card is ready
  cards.ready(function () {
    feedParser.getArticles(function (articles){
      console.log(articles);
      articleData = articles;
      index = articleData[index].index;  
      addContent();
    });
  });

  // Adding the dot carousel - Note: this used to be not hardcoded but transitioning 
  // to the loading screen looked awful so changed to hardcoding outside of addContent
   for (var d=0;d<10;d++){
     var newDot= $('<div />');
     newDot.addClass('dot');
     $(page).find('#dots').append(newDot);
  }

  var addContent = function () {
    addHome(0); //Since on('flip') isn't thrown initially for page0
    addDot(0);
    
    var wrapper = page.querySelector('.wrapper');
    wrapper.innerHTML=''; //Tears down the wrapper to remove default spinner state
    //* Create the slideview
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
     //var kikImg = 'img/perez.jpg';
     var kikLinkData = JSON.stringify(articleData[j]);

      cards.kik.send({
              title    : kikTitle                        ,
              text     : kikDescription                  ,
              pic      : kikImg                          ,
              big      : false                           , 
              linkData : kikLinkData
            });
    });

    //* Adding 'Home' if you flip to the last page
    function addHome(i){
      if (i===(articleData.length - 1)){
        var home = $('<div />');
        home.addClass('app-button left');
        $(page).find('.app-topbar').append(home);
        home.clickable().on('click', function (){
          slideviewer.setPage(0);
        });
      }
      else{
        $(page).find('.app-topbar .app-button.left').remove();
      }
    }

    //* Adding active dot for the page your on
     function addDot(i){
        $(page).find('#dots .dot.active').removeClass('active'); //Remove all active dots
        var current = $(page).find('#dots .dot').eq(i);
        current.addClass('active');
     }

    // Call these functions everytime your flip
    slideviewer.on('flip', function(i){
      addHome(i);
      addDot(i);
    });

    //* Creates the content page
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

      //Finds all the 'children' in the description
      descr.children().each(function(i, descrChild){
        //Finds all the 'children' without an image (<p>) in the description, adds padding to the text
        if ($(this).find('img').length ===0){
          $(this).css('padding',10);
        }
        //Adds default image to articles that have videos in <span> tags
        if ($(this).find('span').length){
          var imgs = $('<img />');
          imgs.attr('src', 'img/pink_video.jpeg');
          //imgs.attr('width', );
          imgs.attr('height', '30%');
          $(this).find('span').replaceWith(imgs);

        }
        //Scale the Embedded YouTube video to fit the page
        if ($(this).find('iframe').length){
          console.log('testing');
          $(this).find('iframe').width('100%');
          $(this).find('iframe').height('56%');
        }
        //Find all the links in the description and override default click behaviour
        //Think of the bug on iPhone when it would fail to load the card after click
        if ($(this).find('a')){
            $(this).find('a').on('click', function(e){
              e.preventDefault();
              cards.browser.open($(this).attr("href"));
            }); 
        }
        //Adds default image to articles
        if ($(descr).find('img').length===0){
          var imgs = new Image();
          imgs.src = 'img/perez.jpg';
          $(descr).prepend(imgs);
        }
      });
    // For any images that were added, make them clickable to the article
    descr.find('img').clickable().on('click', function (){
          cards.browser.open(articleData[i].link); //Click the image, open article URL
    });


      articleSection.append(descr);
      //Actually append all the article elements
      article.append(articleSection);
      article.scrollable();
      return article[0];
    }
  }
}, function (page, article) {// Destructor for Perez

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
      $(this).find('iframe').width('100%');
      $(this).find('iframe').height('56%')
    }
    //Find all the links in the description and override default click behaviour
    //Think of the bug on iPhone when it would fail to load the card after click
    if ($(this).find('a')){
        $(this).find('a').on('click', function(e){
          e.preventDefault();
          cards.browser.open($(this).attr("href"));
        }); 
    }
    //Adds default image to articles
    if ($(descr).find('img').length===0){
      var imgs = new Image();
      imgs.src = 'img/perez.jpg';
      $(descr).prepend(imgs);
    }
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
    var os = cards.utils.platform.os;
    if (os.name === 'android'){
      //Once you dismiss the fromKikPerez viewer we don't want to return to
      //the previous conversation, so need to unbindBack
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