'use strict';

const { marked } = require('marked');
const _ = require('lodash');
const highlighter = require('./highlighter');
const renderer = new marked.Renderer();

renderer.code = function (token) {
    // In marked v15, renderer receives a token object instead of separate parameters
    const code = token.text || token;
    const lang = token.lang || null;

    const output = highlighter(code, lang);
    const finalCode = output != null ? output : code;

    if (!lang) {
        return `<pre><code class="hljs">${finalCode}</code></pre>`;
    }
    return `<pre><code class="hljs ${this.options.langPrefix || 'language-'}${escape(
        lang,
        true,
    )}">${finalCode}</code></pre>`;
};

/*
 * Export the markdown parser.
 */

module.exports = function markdown(content, mdConfig) {
    mdConfig = _.cloneDeep(mdConfig && _.isObject(mdConfig) ? mdConfig : {});
    mdConfig.renderer = renderer;

    return marked.parse(_.toString(content), mdConfig);
};

// TODO: remove if noone understands what this is for
module.exports.toc = function (content, maxDepth, mdConfig) {
    maxDepth = maxDepth || 6;
    mdConfig = mdConfig && _.isObject(mdConfig) ? mdConfig : {};
    mdConfig.renderer = renderer;

    const tokens = marked.lexer(_.toString(content));

    return tokens
        .filter((token) => {
            return token.type === 'heading' && token.depth <= maxDepth;
        })
        .map((token) => {
            token.id = token.text.toLowerCase().replace(/[^\w]+/g, '-');
            return token;
        });
};
