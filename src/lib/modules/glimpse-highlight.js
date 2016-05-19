require('../../../node_modules/highlight.js/styles/vs.css');

var hljs = require('../../../node_modules/highlight.js/lib/highlight.js');

hljs.registerLanguage('cs', require('../../../node_modules/highlight.js/lib/languages/cs'));
hljs.registerLanguage('sql', require('../../../node_modules/highlight.js/lib/languages/sql'));
hljs.registerLanguage('javascript', require('../../../node_modules/highlight.js/lib/languages/javascript'));

module.exports = hljs;