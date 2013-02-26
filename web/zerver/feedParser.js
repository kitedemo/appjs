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

    obj.content = obj.content.replace(/\<p[^>]*\>\<object[^>]*\>[^<]*\<\/object\>\<\/p\>/g, '');
    obj.content = obj.content.replace(/\<script[^>]*\>[^<]*\<\/script\>/g, '');
    obj.content = obj.content.replace(/\<iframe[^>]*\>[^<]*\<\/iframe\>/g, '');

    // This is to remove <script> tags from the HTML (ie. perez.videoplayer)
    // See http://stackoverflow.com/questions/6659351/removing-all-script-tags-from-html-with-js-regular-expression
    // obj.content = obj.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // This shoudl remove <iframe> tags from the HTML
    // obj.content = obj.content.replace(/\<iframe[^>]*\>[^\<]\<\/iframe\>/, '');
    
    articles.push(obj);

    index++;

    if( articles.length === 10 ){
      promise.resolve(articles);
    }
  }

  fp.parseUrl('http://i.perezhilton.com/?feed=atom').on('article', add);

  return promise;
}

function updateArticles () {
  console.log('updating articles..');
  init().then(function(articles) {
    console.log('articles updated');
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
    setInterval(updateArticles, 30 * 60 * 1000);
    updateArticles();
  });
}


startArticleUpdating();

exports.getArticles = function(callback) {
  callback(currentArticles);
};
