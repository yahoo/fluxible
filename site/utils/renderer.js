/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import marked from 'marked';
const renderer = new marked.Renderer();

renderer.heading = function (text, level) {
    let escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

    return (
        '<h' + level + '>' +
        '<a name="' + escapedText + '" class="anchor"></a>' +
        text + ' ' +
        '<a href="#' + escapedText + '" class="hash-link">#</a>' +
        '</h' + level + '>'
    );
};

export default renderer;
