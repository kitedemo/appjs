// Defining some global variables
var articleData = [];
var index = 0;

function mod(a, b) {
  return ((a % b) + b) % b
}

App.populator('Perez1', function (page, article) {

  //Pull in content from PerezHilton.com
  feedParser.getArticles(function (articles){
    console.log(articles);
    articleData = articles;
    index = articleData[index].index; 
    addContent();
  });

  var addContent = function () {
    // Creating an array of img URLS similar to Justin's
    // var bebiezerUrls = [];
    // for (j=0; j<articleData.length; j++){
    //   bebiezerUrls.push($('<div />').html(articleData[j].content).find('img').attr('src'));
    // }

    var wrapper = page.querySelector('.wrapper');

    var slideviewer = new SlideViewer(wrapper, source, {
      startAt: parseInt(articleData[index].index, 10),
    });

    page.addEventListener('appLayout', function () {
      slideviewer.refreshSize();
    })

    function source(i) {
      var article = $('<div />');
      article.css('height', '100%');

      var articleSection = $('<div />');
      articleSection.addClass('app-section');
      articleSection.css('padding', 10);

      var heading = $('<h2 />');
      var head = $('<div />').html(articleData[i].title);
      heading.text(head.text());
      articleSection.append(heading);

      //var img = $('<img />');
      //img.attr('src', bebiezerUrls[mod(i, bebiezerUrls.length)]);
      //articleSection.append(img);

      var content = $('<p />');
      var descr = $('<div />').html(articleData[i].content);
      descr.find('img').clickable().on('click', function (){
            cards.browser.open(articleData[i].link); 
      });
      if (descr.find('img').length ===0){
        console.log('test');
      }

      content.append(descr);
      articleSection.append(content);

      var articleSection2 = $('<div />');
      articleSection2.addClass('app-section');

      article.append(articleSection);
      article.append(articleSection2);

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