/**
 * Copyright (c) 2018 Uncharted Software Inc.
 * http://www.uncharted.software/
 */

'use strict';

const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');
const pbiviz = require(path.join(process.cwd(), 'pbiviz.json'));
const packageJson = require(path.join(process.cwd(), 'package.json'));

const userName = cp.execSync('whoami').toString();
const userHash = crypto.createHash('md5').update(userName).digest('hex');

function pbivizPluginTemplate(pbiviz) {
    return `(function (powerbi) {
        var visuals;
        (function (visuals) {
            var plugins;
            (function (plugins) {
                /* ESSEX Capabilities Patcher */
                plugins['${pbiviz.visual.guid}'] = {
                    name: '${pbiviz.visual.guid}',
                    displayName: '${pbiviz.visual.name}',
                    class: '${pbiviz.visual.visualClassName}',
                    version: '${packageJson.version}',
                    apiVersion: '${pbiviz.apiVersion}',
                    capabilities: '{}',
                    create: function (/*options*/) {
                        var instance = Object.create(${pbiviz.visual.visualClassName}.prototype);
                        ${pbiviz.visual.visualClassName}.apply(instance, arguments);
                        return instance;
                    },
                    custom: true
                };

                /* save version number to visual */
                ${pbiviz.visual.visualClassName}.__essex_build_info__ = '${packageJson.version} ${Date.now()} [${userHash}]';
                Object.defineProperty(${pbiviz.visual.visualClassName}.prototype, '__essex_build_info__', { get: function() { return ${pbiviz.visual.visualClassName}.__essex_build_info__; } } );
            })(plugins = visuals.plugins || (visuals.plugins = {}));
        })(visuals = powerbi.visuals || (powerbi.visuals = {}));
    })(window['powerbi'] || (window['powerbi'] = {}));`;
}

/**
 * Webpack loader function that appends pbiviz plugin code at the end of the provided source
 */
function pluginLoader(source, map) {
    this.cacheable();
    source = source + '\n' + pbivizPluginTemplate(pbiviz);
    this.callback(null, source, map);
}

module.exports = pluginLoader;
