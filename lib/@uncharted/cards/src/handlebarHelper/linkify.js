/*
 * Copyright 2018 Uncharted Software Inc.
 */

// import { Utils, SafeString } from 'handlebars/runtime';
import { Utils, SafeString } from 'handlebars';

function isUrl(url) {
    const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(url);
}

function getHostName(url) {
    var link = document.createElement('a');
    link.href = url;
    return link.hostname;
}

function getLink(href, text) {
    return `<a href="${href}" target="_blank" title="${ href }">${text}</a>`;
}

function isMailTo(text) {
    const regexp = /mailto:*/;
    return regexp.test(text);
}

function linkify(text) {
    if (isUrl(text)) {
        return getLink(text, getHostName(text).replace('www.', ''));
    }
    if (isMailTo(text)) {
        return getLink(text, text.replace('mailto:', ''));
    }
    return text;
}

export default function(text) {
    const escapedText = Utils.escapeExpression(text);
    return new SafeString(linkify(escapedText));
}
