import Handlebars from 'handlebars';

export default function(text) {
    const escapedText = Handlebars.Utils.escapeExpression(text);
    let result = escapedText;
    try {
        result = `<a href="${escapedText}" target="_blank" title="${ escapedText }">${ new URL(escapedText).hostname.replace('www.', '') }</a>`;
    } catch (e) {} //eslint-disable-line
    return new Handlebars.SafeString(result);
}
