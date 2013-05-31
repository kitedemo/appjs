// ----------------
// Default UI for Perez
// ----------------

// Global Variables
var articleData = [];
var index = 0;
var length;

App.populator('Have You Heard?', function (page, article) {

  // When card.ready / not blocking DOM Load, fetch articles and store them
  cards.ready(function () {
    feedParser.getArticles(function (articles){ //Actually fetches the articles
      articles = articles.sort(function (a, b) { //Sort articles by issued time
        return (b.issued-a.issued);
      });
      console.log('Total number of current articles: ' + articles.length);
      console.log(articles);

      // If articles exist/can fetch, store for offline mode
      if (articles){
        articleData = articles;
        index = articleData[index].index;  
        addContent(); 

        Store.set('articles', articles);
      }
      else{
        //If can't fetch articles/DNE,  retrieve from cache
        articles = Store.get('articles');
      }
    }).error(function(){
      //Went to db but couldn't retrieve articles from it, serve cached articles 
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

  // ----------------
  // Add Article Content - Title, Pic, Description
  // ----------------
  function addContent (){
    // ----------------
    // "Reload" Button -  Load articles again with a slide right transition
    // ----------------
    var reload = $('<div />');
    reload.addClass('app-button reload');
    $(page).find('.app-topbar').append(reload);
    reload.clickable().on('click', function (){
      _gaq.push(['_trackEvent', 'tappedReloadButton', 'Reload']);
      index=0;
      App.load('Have You Heard?', articleData[index], 'slide-right', function () {
        try {
          App.removeFromStack(0); //When done loading new Perez1, remove old from the backstack
        }
        catch (err) {}
      });
    });

    // ----------------
    // "Kik" Button
    // ----------------
    $(page).find('#kik').on('click', function (){
     _gaq.push(['_trackEvent', 'KikArticle', 'Send']);
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

    // ----------------
    // "Create SlideViewer"
    // ----------------
    var wrapper = page.querySelector('.wrapper');
    wrapper.innerHTML=''; //Tears down the wrapper to remove default spinner state
    var size = articleData.length;
    var slideviewer = new SlideViewer(wrapper, source, {
      startAt: 0,
      length: size
    });
    page.addEventListener('appLayout', function () {
      slideviewer.refreshSize();
    })

    // ----------------
    // Creates the content page
    // ----------------
    function source(i) {
      _gaq.push(['_trackEvent', 'flipped', 'Flipped']);
      var article = $('<div />');
      article.css('height', '100%');
      var articleSection = $('<div />');
      articleSection.addClass('app-section');

      // ----------------
      // Headline
      // ----------------
      var heading = $('<h2 />');
      var head = $('<div />').html(articleData[i].title); //Use HTML to remove 'escape entities'
      heading.text(head.text());
      heading.clickable().on('click', function (){
        _gaq.push(['_trackEvent', 'tappedOnTitle', 'OpenTitle']);
        cards.browser.open(articleData[i].link);
      });
      heading.css('padding',10);
      articleSection.append(heading);

      // ----------------
      // Description (includes Article Image)
      // ----------------
      if (articleData[i].content.indexOf('<!--more-->') > 0){
        //console.log(articleData[i].content);
        //console.log(articleData[i].content.indexOf('<!--more-->'));
        articleData[i].content = articleData[i].content.substr(0, articleData[i].content.indexOf('<!--more-->'));
      }
      var descr = $('<div />').html(articleData[i].content);

      //Custom Content Fix -Finds all the 'children' without images ie. (<p>), adds padding to the text
      descr.children().not(descr.children().has('img')).css('padding',10);

      //Custom Content Fix - Adds default image to articles that have videos in <span> tags
      if (descr.find('span').length){
        var imgs = $('<img />');
        imgs.attr('src', 'img/pink_video_noun.svg');
        imgs.addClass('centeredImage');
        descr.find('span').replaceWith(imgs);
        imgs.parent().css('text-align', 'center');
      }

      //Custom Content Fix - Scale the Embedded YouTube video to fit the page
      descr.find('iframe').width('100%').height('56%');

      //Custom Content Fix - Find all the poll articles and remove the poll form, loading spinners and vote buttons
      descr.find('.wp-polls-loading').remove();
      descr.find('.wp-polls form').remove();
      descr.find('a[href$="#VotePoll"]').remove();

      //Custom Content Fix - Find all the links in the description and override default click behaviour (think iPhone)
      descr.find('a').on('click', function(e){
        _gaq.push(['_trackEvent', 'tappedArticleLink', 'OpenLink']);
        e.preventDefault();
        cards.browser.open($(this).attr("href"));
      }); 

      //Custom Content Fix - Adds default image to articles
      if (descr.find('img').length === 0){
        var imgs = new Image();
        imgs.src = 'img/image_not_available_noun.svg';
        $(descr).find('p').first().prepend(imgs);
        var tempImg = $(imgs);
        tempImg.css('width', '50%');
        tempImg.css('margin-left', '25%');
      }     

      //Update content with all the custom items
      articleData[i].content = descr.html();

      //All images should be clickable
      descr.find('img').clickable().on('click', function (){
        _gaq.push(['_trackEvent', 'tapImage', 'OpenImage']);
        cards.browser.open(articleData[i].link);
      });
      articleSection.append(descr);
      article.append(articleSection);

      //Slideviewer Fix - Android > ICS touch events are consumed on some slide viewer pages + iOS5 List Scrolling, have to use iScroll
      if ( (App.platform === 'android' && App.platformVersion >= 4) || (App.platform ==='ios' && (App.platformVersion>=5 && App.platformVersion <6))) {
        article.scrollable(true); 
      }
      else{
        article.scrollable();
      }
    return article[0];
    }
  }
}, function (page, article) {// Destructor for Perez1
  var os = cards.utils.platform.os;
  if (os.name === 'android'){
    //After dismissing fromKikPerez don't return conversations, need to unbind physical back button
    cards.browser.unbindBack(handleBackButton);
  }
});




// ----------------
// fromKikPerez Viewer
// ----------------
App.populator('fromKikPerez', function (page, linkData) {
  _gaq.push(['_trackEvent', 'openFromKik', 'OpenKik']);

  //Android - Open from a Kik message, handle the back button
  var os = cards.utils.platform.os;
  if (os.name === 'android'){
    cards.browser.back(handleBackButton);  
  }

  // ----------------
  // fromKikPerez Viewer - Same UI as PerezViewer
  // ----------------
  $(page).find('#headline').html(linkData.title);
  var descr = $('<div />').html(linkData.content);
  $(page).find('#story').append(descr);
  $(page).find('#headline').clickable().on('click', function () {
    _gaq.push(['_trackEvent', 'tappedOnTitleFromKik', 'OpenTitleFromKik']);
    cards.browser.open(linkData.link); 
  });
  var img = descr.find('img');
  $(img).clickable().on('click', function () {
    _gaq.push(['_trackEvent', 'tapImageFromKik', 'OpenImageFromKik']);
    cards.browser.open(articleData[index].link); 
  });

  //Since opened from a Kik, no slide viewer, thus force user to go 'Home'
  $(page).find('#home').on('click', function () {
    _gaq.push(['_trackEvent', 'closeFromKik', 'closeFromKik']);
    index=0;
    App.load('Have You Heard?', articleData[index], 'slideoff-down', function () { //This is a callback:)
      //When done loading new Perez1, remove from the backstack
      try {
        App.removeFromStack(0);
      }
      catch (err) {}
    });
  });

  //Able to send article via Kik again
  $(page).find('#kik').on('click', function () {
    _gaq.push(['_trackEvent', 'KikedFromKik', 'KikedFromKik']);
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
      //After dismissing fromKikPerez don't return conversations, need to unbind physical back button
      cards.browser.unbindBack(handleBackButton);
    }
});



// ----------------
// Android Only - Handle Physical back button
// ----------------
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


// ----------------
// Open From Kik Message - use fromKikPerez
// ----------------
if (cards.browser && cards.browser.linkData) {
  // Card was launched by a conversation
  App.load('fromKikPerez', cards.browser.linkData);
}
// ----------------
// Otherwise use default UI - Have You Heard? 
// ----------------
else {
    App.load('Have You Heard?', articleData[0]);
}