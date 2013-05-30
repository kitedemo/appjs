var redis = require('redis-url')
        //.connect(process.env.REDISTOGO_URL)
        .connect('redis://localhost:6379')
        .on('error', function () {});

var masterArticles = [];
var defaultArticles;

function init () {
  var fp       = require('feedparser'),
      Promise  = require('rsvp').Promise,
      promise  = new Promise(),
      fromAtomArticles = [],
      index    = 0;

  function add (article) {

    //console.log(JSON.stringify(article));
    // Make an Article object, add it to an array
    var obj     = {};
    obj.index   = index;
    obj.timestamp = +new Date() - index; //Adding a unique timestamp to each article
    obj.issued  = new Date(article['pubdate']).getTime();
    obj.title   = article['title'];
    obj.content = article['description'];
    obj.link    = article['link'];
    obj.id      = article['guid'];
    obj.description = article['summary'];

    //This should remove certain tags from the HTML (ie. perez.videoplayer)
    obj.content = obj.content.replace(/\<p[^>]*\>\<object[^>]*\>[^<]*\<\/object\>\<\/p\>/g, '');
    obj.content = obj.content.replace(/\<script[^>]*\>[^<]*\<\/script\>/g, '');
    obj.content = obj.content.replace(/\<iframe[^>]*\>[^<]*\<\/iframe\>/g, '');

    //Add a new article to the stack and increment topArticle pointer and index
    fromAtomArticles.push(obj);

    index++;

    if(fromAtomArticles.length === 100 ){
      promise.resolve(fromAtomArticles);
    }
  }

  //Initializing the app with 30 articles
  fp.parseUrl('http://perezhilton.com/cocoperez/page/5/?feed=atom').on('article', add);
  fp.parseUrl('http://i.perezhilton.com/page/5/?feed=atom').on('article', add);
  fp.parseUrl('http://perezhilton.com/cocoperez/page/4/?feed=atom').on('article', add);
  fp.parseUrl('http://i.perezhilton.com/page/4/?feed=atom').on('article', add);
  fp.parseUrl('http://perezhilton.com/cocoperez/page/3/?feed=atom').on('article', add);
  fp.parseUrl('http://i.perezhilton.com/page/3/?feed=atom').on('article', add);
  fp.parseUrl('http://perezhilton.com/cocoperez/page/2/?feed=atom').on('article', add);
  fp.parseUrl('http://i.perezhilton.com/page/2/?feed=atom').on('article', add);
  fp.parseUrl('http://perezhilton.com/cocoperez/?feed=atom').on('article', add);
  fp.parseUrl('http://i.perezhilton.com/?feed=atom').on('article', add);
  return promise;
}

function updateArticles () {
  console.log('Updating Articles... vick');
  init().then(function(fromAtomArticles) {
    console.log(fromAtomArticles.length);
    defaultArticles = fromAtomArticles;
    console.log('Articles Updated');
    //console.log(fromAtomArticles.length);

    //Checks for duplicates in the articles against the masterArticles array
    //Removes dupe articles from masterArticles array
    for (var k = fromAtomArticles.length - 1; k >= 0; k--) {
      
      var article = fromAtomArticles[k];

      var repeatArticle = false;
      for(var i = masterArticles.length - 1; i >= 0; i--){
        if (article.link == masterArticles[i].link){
          //var test = fromAtomArticles.splice(k, 1);
          console.log("repeat " + article.link);
          repeatArticle = true;
          break;
        }
        else
        {
          //console.log(article.link + " is not the same as " + masterArticles[i].link);
        }
      }
      if (!repeatArticle)
      {
        masterArticles.push(article);
      }
    }

    //Combines the articles and masterArticles array
    //masterArticles = fromAtomArticles.concat(masterArticles);

    redis.set('articles', JSON.stringify(masterArticles));
  });
}

function startArticleUpdating () {  
  redis.get('articles', function (err, jsonArticles) {
    /*
    if (!err && jsonArticles) {
      console.log("ping");
      var fromAtomArticles;
      try {
        fromAtomArticles = JSON.parse(jsonArticles);
      }
      catch (err) {}
      if (typeof fromAtomArticles === 'object') {
        console.log("masterArticles set");
        masterArticles = fromAtomArticles;
      }
    }
    */
    // Fetch new articles every 15 mins
    //setInterval(updateArticles, 15 * 10 * 1000);
    setInterval(updateArticles, 15 * 60 * 1000);
    updateArticles();
  });
}

startArticleUpdating();

exports.getArticles = function (issued, callback) {
  if (typeof issued === 'function') {
    callback  = issued;
    issued = null;
  }

  //If no masterArticles should get all new articles
  if ( masterArticles.length == 0 ) {
    console.log('UNEXPECTED BEHAVIOR');
    return;
  }

  //If articles have an issue date that is not null, masterArticles are unchanged
  if ( !issued) {
    callback(masterArticles);
    console.log('masterArticles is unchanged');
    return;
  }

  //If articles with timestamps older than the master one, 
  var newArticles = [];
  masterArticles.forEach(function (article) {
    if (article.issued > issued) {
      console.log(article.title);
      newArticles.push(article);
      console.log('Pushing new articles');
    }
  });

  callback(newArticles);
};