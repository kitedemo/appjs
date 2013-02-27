// Defining some global variables
var articleData = [];
var index = 0;

function mod(a, b) {
  return ((a % b) + b) % b
}

App.populator('Perez1', function (page, article) {

  //Pull in content from PerezHilton.com
  feedParser.getArticles(function (articles){
    articleData = articles;
    index = articleData[index].index; 
    addContent();
  });

  var addContent = function () {
    //Creating an array of URLS like Justin's
    var descr0 = $('<div />').html(articleData[0].content);
    var img0 = descr0.find('img');
    var imgURL0 = img0.attr('src');
    
    var descr1 = $('<div />').html(articleData[1].content);
    var img1 = descr1.find('img');
    var imgURL1 = img1.attr('src');

    var descr2 = $('<div />').html(articleData[2].content);
    var img2 = descr2.find('img');
    var imgURL2 = img2.attr('src');

    var bebiezerUrls = [imgURL0, imgURL1, imgURL2];
    //console.log(bebiezerUrls);

    var wrapper = page.querySelector('.wrapper');

    var slideviewer = new SlideViewer(wrapper, source, {
      startAt: parseInt(articleData[index].index, 10),
    });

    page.addEventListener('appLayout', function () {
      slideviewer.refreshSize();
    })

    function source(i) {
      var article = document.createElement('div');
      article.style.height = '100%';

      var heading = document.createElement('h2');
      heading.innerText = 'Bieebr is onto GF #' + i + '!';
      article.appendChild(heading);

      var img = document.createElement('img');
      img.src = bebiezerUrls[mod(i, bebiezerUrls.length)];
      article.appendChild(img);

      var content = document.createElement('p');
      content.innerText = 'Can you believe it???? He left that last one so quickly! She will be so upset! Imagnge the headrbreak#!';
      article.appendChild(content);

      Scrollable(article);

      return article;
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