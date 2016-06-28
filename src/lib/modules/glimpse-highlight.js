require('../../../node_modules/highlight.js/styles/vs.css');

var hljs = require('../../../node_modules/highlight.js/lib/highlight.js');

hljs.registerLanguage('cs', require('../../../node_modules/highlight.js/lib/languages/cs'));
hljs.registerLanguage('css', require('../../../node_modules/highlight.js/lib/languages/css'));
hljs.registerLanguage('sql', require('../../../node_modules/highlight.js/lib/languages/sql'));
hljs.registerLanguage('javascript', require('../../../node_modules/highlight.js/lib/languages/javascript'));
hljs.registerLanguage('json', require('../../../node_modules/highlight.js/lib/languages/json'));
hljs.registerLanguage('livescript', require('../../../node_modules/highlight.js/lib/languages/livescript'));
hljs.registerLanguage('xml', require('../../../node_modules/highlight.js/lib/languages/xml'));

module.exports = hljs;