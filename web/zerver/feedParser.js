function init () {
  var fp       = require('feedparser'),
      Promise  = require('rsvp').Promise,
      promise  = new Promise(),
      articles = [],
      index    = 0;
      //img = '';

  function add (article) {
    // Make an Article object, add it to an array
    var obj     = {};
    obj.index   = index;
    obj.title   = article['title'];
    obj.content = article['description'];
    obj.link    = article['link'];
    obj.description = article['summary'];

    obj.content = obj.content.replace(/\<p[^>]*\>\<object[^>]*\>[^\<]\<\/object\>\<\/p\>/, '');
    // This is to remove <script> tags from the HTML (ie. perez.videoplayer)
    // See http://stackoverflow.com/questions/6659351/removing-all-script-tags-from-html-with-js-regular-expression
    obj.content = obj.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    articles.push(obj);

    index++;

    if( articles.length === 10 ){
      promise.resolve(articles);
    }
  }

  fp.parseUrl('http://i.perezhilton.com/?feed=atom').on('article', add);

  return promise;
}


exports.getArticles = function(callback) {
  init().then(function(articles) {
    callback(articles);
  });
};
