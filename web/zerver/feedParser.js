var redis = require('redis-url')
        .connect(process.env.REDISTOGO_URL)
        .on('error', function () {});

var currentArticles;

function init () {
  var fp       = require('feedparser'),
      Promise  = require('rsvp').Promise,
      promise  = new Promise(),
      articles = [],
      index    = 0;

  function add (article) {
    // Make an Article object, add it to an array
    var obj     = {};
    obj.index   = index;
    obj.title   = article['title'];
    obj.content = article['description'];
    obj.link    = article['link'];
    obj.description = article['summary'];

    //This should remove certain tags from the HTML (ie. perez.videoplayer)
    obj.content = obj.content.replace(/\<p[^>]*\>\<object[^>]*\>[^<]*\<\/object\>\<\/p\>/g, '');
    obj.content = obj.content.replace(/\<script[^>]*\>[^<]*\<\/script\>/g, '');
    obj.content = obj.content.replace(/\<iframe[^>]*\>[^<]*\<\/iframe\>/g, '');

    articles.push(obj);

    index++;

    if( articles.length === 10 ){
      promise.resolve(articles);
    }
  }

  fp.parseUrl('http://i.perezhilton.com/?feed=atom').on('article', add);
  fp.parseUrl('http://perezhilton.com/cocoperez/?feed=atom').on('article', add);
  fp.parseUrl('http://perezhilton.com/perezitos/?feed=atom').on('article', add);

  return promise;
}

function updateArticles () {
  console.log('Updating Articles...');
  init().then(function(articles) {
    console.log('Articles Updated!');
    currentArticles = articles;
    redis.set('articles', JSON.stringify(articles));
  });
}

function startArticleUpdating () {  
  redis.get('articles', function (err, jsonArticles) {
    if (!err && jsonArticles) {
      var articles;
      try {
        articles = JSON.parse(jsonArticles);
      }
      catch (err) {}
      if (typeof articles === 'object') {
        currentArticles = articles;
      }
    }
    // Fetch new articles every 30 mins
    setInterval(updateArticles, 15 * 60 * 1000);
    updateArticles();
  });
}


startArticleUpdating();

exports.getArticles = function(callback) {
  callback(currentArticles);
};
