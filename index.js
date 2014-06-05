var OctosmashedFixturesCompiler;
var jsYaml = require('yaml-front-matter');
var marked = require('marked');
var hljs = require('highlight.js');

module.exports = OctosmashedFixturesCompiler = (function() {
  function OctosmashedFixturesCompiler() {};

  var allCategories = [];
  var allPosts = [];

  var categoryIndex = 0;
  var postIndex = 0;

  OctosmashedFixturesCompiler.prototype.modulesPrefix = 'module.exports = ';
  OctosmashedFixturesCompiler.prototype.brunchPlugin = true;
  OctosmashedFixturesCompiler.prototype.type = 'template';
  OctosmashedFixturesCompiler.prototype.extension = 'md';
  OctosmashedFixturesCompiler.prototype.pattern = /(\.(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text))$/;

  OctosmashedFixturesCompiler.prototype.compile = function(data, path, callback) {
    var err, error, result;
    var customRenderer = new marked.Renderer();

    marked.setOptions({
      // Block code
      highlight: function (code, lang) {
        code = replaceHandlebars(code);

        if (lang) {
          return hljs.highlight(lang, code).value;
        } else {
          return hljs.highlightAuto(code).value;
        }
      },
    });

    // Inline code
    customRenderer.codespan = function(text, level) {
      text = replaceHandlebars(text);
      return '<code>' + text + '</code>';
    }

    try {
      var compiled = jsYaml.loadFront(data);

      compiled.__content = marked(compiled.__content, { renderer: customRenderer });

      this.prepForFixtures(compiled);

      compiled = this.modulesPrefix + compiled;

      return result = compiled;
    } catch (_error) {
      err = _error;
      return error = err;
    } finally {
      callback(error, result);
    }
  };

  OctosmashedFixturesCompiler.prototype.prepForFixtures = function(post) {
    var categories = post.categories;
    var published, newPost, newCat;

    categories.forEach(function(cat) {
      // If category has not already been added to fixtures...
      if (allCategories.indexOf(cat) == -1) {
        newCat = { id: categoryIndex, name: cat };
        allCategories.push(newCat);
        categoryIndex++;
      }
    });

    post['urlString'] = dasherize(post['title']);
    console.log(post['urlString']);
    post['__content'] = replaceApostrophes(post['__content']);
    post['publishedObject'] = new Date(post['published']);
    post['id'] = postIndex;
    postIndex++;

    allPosts.push(post);

    return post;
  };

  var replaceHandlebars = function(text) {
    return text.replace(/{{/g, '&#123;&#123;').replace(/}}/g, '&#125;&#125;');
  }

  var replaceApostrophes = function(text) {
    return text.replace(/&#39;/g,'\u0027');
  }

  var dasherize = function(text) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/\W\-/g, '');
  }

  return OctosmashedFixturesCompiler;
})();
