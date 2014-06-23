/**
This is a port of another NPM module found at:
https://github.com/sir-dunxalot/yaml-front-matter-brunch
*/

var OctosmashedFixturesCompiler;

/**
Dependencies
*/

var jsYaml = require('yaml-front-matter');
var marked = require('marked');
var hljs = require('highlight.js');

/**
Helper methods
*/

var replaceHandlebars = function(text) {
  return text.replace(/{{/g, '&#123;&#123;').replace(/}}/g, '&#125;&#125;');
}

var replaceApostrophes = function(text) {
  return text.replace(/&#39;/g,'\u0027');
}

var dasherize = function(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^-a-z \d]/ig, '');
}

/**
Compiler
*/

module.exports = OctosmashedFixturesCompiler = (function() {
  function OctosmashedFixturesCompiler() {};

  /**
  Options
  */

  OctosmashedFixturesCompiler.prototype.modulesPrefix = 'module.exports = ';
  OctosmashedFixturesCompiler.prototype.brunchPlugin = true;
  OctosmashedFixturesCompiler.prototype.type = 'template';
  OctosmashedFixturesCompiler.prototype.extension = 'md';
  OctosmashedFixturesCompiler.prototype.pattern = /(\.(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text))$/;

  OctosmashedFixturesCompiler.prototype.compile = function(data, path, callback) {
    var err, error, result;
    var customRenderer = new marked.Renderer();

    /**
    Markdown parsing options
    */

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

      /**
      Parse post as YAML front matter
      */

      var compiled = jsYaml.loadFront(data);

      /**
      Parse post content as markdown
      */

      compiled.__content = marked(compiled.__content, {
        renderer: customRenderer
      });

      /**
      Add categories and posts to fixtures
      */

      this.prepFixtures(compiled);

      compiled = JSON.stringify(compiled);
      compiled = this.modulesPrefix + compiled;

      return result = compiled;
    } catch (_error) {
      err = _error;
      return error = err;
    } finally {
      callback(error, result);
    }
  };

  /**
  Add categories and posts to fixtures
  */

  OctosmashedFixturesCompiler.prototype.prepFixtures = function(post) {
    var categories = post.categories;
    var published, newPost, newCat;

    post['urlString'] = dasherize(post['title']);
    post['__content'] = replaceApostrophes(post['__content']);

    return post;
  };

  return OctosmashedFixturesCompiler;
})();
