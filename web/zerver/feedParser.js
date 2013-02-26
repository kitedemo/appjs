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
    obj.description = article['rss:description']['#'];

    obj.content = obj.content.replace(/\<p[^>]*\>\<object[^>]*\>[^<]*\<\/object\>\<\/p\>/, '');
    
    articles.push(obj);

    index++;

    if( articles.length === 10 ){
      promise.resolve(articles);
    }
  }

  fp.parseUrl('http://i.perezhilton.com/?feed=rss2').on('article', add);

  return promise;
}


exports.getArticles = function(callback) {
  init().then(function(articles) {
    callback(articles);
  });
};
