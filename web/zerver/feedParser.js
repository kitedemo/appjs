var redis = require('redis-url')
        //.connect(process.env.REDISTOGO_URL)
        .connect('redis://localhost:6379')
        .on('error', function () {});

var masterArticles;
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
    obj.description = article['summary'];


    //This should remove certain tags from the HTML (ie. perez.videoplayer)
    obj.content = obj.content.replace(/\<p[^>]*\>\<object[^>]*\>[^<]*\<\/object\>\<\/p\>/g, '');
    obj.content = obj.content.replace(/\<script[^>]*\>[^<]*\<\/script\>/g, '');
    obj.content = obj.content.replace(/\<iframe[^>]*\>[^<]*\<\/iframe\>/g, '');

    //Add a new article to the stack and increment topArticle pointer and index
    fromAtomArticles.push(obj);

    index++;

    if(fromAtomArticles.length === 10 ){
      promise.resolve(fromAtomArticles);
    }
  }

  //Initializing the app with 30 articles
  fp.parseUrl('http://i.perezhilton.com/?feed=atom').on('article', add);

  return promise;
}

function updateArticles () {
  console.log('Updating Articles...');
  init().then(function(fromAtomArticles) {
    defaultArticles = fromAtomArticles;
    console.log('Articles Updated');

    //Checks for duplicates in the articles against the masterArticles array
    //Removes dupe articles from masterArticles array
    for (var k = fromAtomArticles.length - 1; k >= 0; k--) {
      
      var article = fromAtomArticles[k];
      for(var i = masterArticles.length - 1; i >= 0; i--){
        if (article.link === masterArticles[i].link){
          //console.log('from atom timestamp ' + article.issued);
          //console.log('master timestamp ' + masterArticles[i].issued);
          var test = fromAtomArticles.splice(k, 1);
          //console.log(test[0].issued);
          break;
        }
      }
    }

    //Combines the articles and masterArticles array
    console.log(fromAtomArticles.length);
    console.log(masterArticles.length);
    masterArticles = fromAtomArticles.concat(masterArticles);
    //console.log(masterArticles.length);

    redis.set('articles', JSON.stringify(masterArticles));
  });
}

function startArticleUpdating () {  
  redis.get('articles', function (err, jsonArticles) {
    if (!err && jsonArticles) {
      var fromAtomArticles;
      try {
        fromAtomArticles = JSON.parse(jsonArticles);
      }
      catch (err) {}
      if (typeof fromAtomArticles === 'object') {
        masterArticles = fromAtomArticles;
      }
    }
    // Fetch new articles every 15 mins
    //setInterval(updateArticles, 1 * 10 * 1000);

    setInterval(updateArticles, 1 * 60 * 1000);
    updateArticles();
  });
}

startArticleUpdating();

exports.getArticles = function (timestamp, callback) {
  if (typeof timestamp === 'function') {
    callback  = timestamp;
    timestamp = null;
  }

  //If no masterArticles should get all new articles
  if ( !masterArticles ) {
    masterArticles = defaultArticles;
    return;
  }

  //If articles without a timestamp, masterArticles will contain all new articles
  if ( !timestamp ) {
    callback(masterArticles);
    console.log('!timestamp, same masterArticles');
    return;
  }

  //If articles with timestamps older than the master one, 
  var newArticles = [];
  masterArticles.forEach(function (article) {
    if (article.timestamp > timestamp) {
      newArticles.push(article);
      console.log('!Push articles with > timestamp');
    }
  });

  callback(newArticles);
};