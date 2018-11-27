/**
 * Copyright (c) 2018 Uncharted Software Inc.
 * http://www.uncharted.software/
 */

"use strict";

const fs = require('fs');
const zip = require('node-zip')();
const path = require('path');
const sass = require('node-sass');
const CleanCSS = require('clean-css');
const mkdirp = require('mkdirp');
const webpack = require("webpack");
const MemoryFS = require("memory-fs");
const pbivizJson = require('../pbiviz.json');
const packageJson = require('../package.json');
const capabilities = require(path.join('..', pbivizJson.capabilities));
const webpackConfig = require('../webpack.config');
const buildOSSReport = require('./buildOSSReport.js');

const packagingWebpackConfig = {
    output: {
        filename: 'visual.js', path: '/'
    },
};

const _buildLegacyPackageJson = () => {
    const pack = {
        version: packageJson.version,
        author: pbivizJson.author,
        licenseTerms: packageJson.license,
        privacyTerms: packageJson.privacyTerms,
        resources: [
            {
                "resourceId": "rId0",
                "sourceType": 5,
                "file": `resources/${ pbivizJson.visual.guid }.ts`
            },
            {
                "resourceId": "rId1",
                "sourceType": 0,
                "file": `resources/${ pbivizJson.visual.guid }.js`
            },
            {
                "resourceId": "rId2",
                "sourceType": 1,
                "file": `resources/${ pbivizJson.visual.guid }.css`
            },
            {
                "resourceId": "rId3",
                "sourceType": 3,
                "file": `resources/${path.basename(pbivizJson.assets.icon)}`
            },
            {
                "resourceId": "rId4",
                "sourceType": 6,
                "file": `resources/${path.basename(pbivizJson.assets.thumbnail)}`
            },
            {
                "resourceId": "rId5",
                "sourceType": 2,
                "file": `resources/${path.basename(pbivizJson.assets.screenshot)}`
            }
        ],
        visual: Object.assign({ version: packageJson.version }, pbivizJson.visual),
        "code": {
            "typeScript": {
                "resourceId": "rId0"
            },
            "javaScript": {
                "resourceId": "rId1"
            },
            "css": {
                "resourceId": "rId2"
            }
        },
        "images": {
            "icon": {
                "resourceId": "rId3"
            },
            "thumbnail": {
                "resourceId": "rId4"
            },
            "screenshots": [
                {
                    "resourceId": "rId5"
                }
            ]
        }
    };

    delete pack.visual.visualClassName;

    const date = new Date();
    pack.build = date.getUTCFullYear().toString().substring(2) + '.' + (date.getUTCMonth() + 1) + '.' + date.getUTCDate() + '.' + ((date.getUTCHours() * 3600) + (date.getUTCMinutes() * 60) + date.getUTCSeconds());

    return pack;
};

const _buildPackageJson = () => {
    return {
        version: packageJson.version,
        author: pbivizJson.author,
        licenseTerms: packageJson.license,
        privacyTerms: packageJson.privacyTerms,
        resources: [
            {
                resourceId: 'rId0',
                sourceType: 5,
                file: `resources/${ pbivizJson.visual.guid }.pbiviz.json`,
            }
        ],
        visual: Object.assign({ version: packageJson.version }, pbivizJson.visual),
        metadata: {
            pbivizjson: {
                resourceId: 'rId0'
            }
        }
    };
};

const buildPackageJson = pbivizJson.apiVersion ? _buildPackageJson() : _buildLegacyPackageJson();

const compileSass = () => {
    const sassOutput = sass.renderSync({ file: pbivizJson.style }).css.toString();
    const options = { 
        level: { 
            2: {
                all: true,
                mergeNonAdjacentRules: false,
            },
        },
    };
    const cssContent = new CleanCSS(options).minify(sassOutput).styles;
    return cssContent;
};

const compileScripts = (callback) => {
    const regex = new RegExp("\\bpowerbi-visuals.d.ts\\b");
    const fs = new MemoryFS();
    const compiler = webpack(Object.assign(webpackConfig, packagingWebpackConfig));
    compiler.outputFileSystem = fs;
    compiler.run((err, stats) => {
        if (err) throw err;
        const jsonStats = stats.toJson(true);
        const errors = jsonStats.errors.filter(error => !regex.test(error));
        console.info('Time:', jsonStats.time);
        console.info('Hash:', jsonStats.hash);
        jsonStats.warnings.forEach(warning => console.warn('WARNING:', warning));
        errors.forEach(error => !regex.test(error) && console.error('ERROR:', error));
        if (errors.length > 0) {
            return process.exit(1);
        }
        console.log('Building OSS report...');
        buildOSSReport(jsonStats.modules, ossReport => {
            const fileContent = fs.readFileSync("/visual.js").toString();
            callback(err, fileContent, ossReport);
        });
    });
};

const _buildLegacyPackage = (fileContent) => {
    const icon = fs.readFileSync(pbivizJson.assets.icon);
    const thumbnail = fs.readFileSync(pbivizJson.assets.thumbnail);
    const screenshot = fs.readFileSync(pbivizJson.assets.screenshot);
    const iconType = pbivizJson.assets.icon.indexOf('.svg') >= 0 ? 'svg+xml' : 'png';
    const iconBase64 = `data:image/${iconType};base64,` + icon.toString('base64');
    const cssContent = compileSass() + `\n.visual-icon.${pbivizJson.visual.guid} {background-image: url(${iconBase64});}`;
    zip.file('package.json', JSON.stringify(buildPackageJson, null, 2));
    zip.file(`resources/${pbivizJson.visual.guid}.js`, fileContent);
    zip.file(`resources/${pbivizJson.visual.guid}.ts`, `/** See ${pbivizJson.visual.guid}.js **/`);
    zip.file(`resources/${pbivizJson.visual.guid}.css`, cssContent + `\n`);
    zip.file(`resources/${path.basename(pbivizJson.assets.icon)}`, icon);
    zip.file(`resources/${path.basename(pbivizJson.assets.thumbnail)}`, thumbnail);
    zip.file(`resources/${path.basename(pbivizJson.assets.screenshot)}`, screenshot);
    fs.writeFileSync(pbivizJson.output, zip.generate({ base64:false,compression:'DEFLATE' }), 'binary');
};

const _buildPackage = (fileContent) => {
    const jsContent = 'var window = window.document.defaultView;\nvar $ = window.$;\n var _ = window._;\n' + fileContent;
    const cssContent = compileSass();
    const icon = fs.readFileSync(pbivizJson.assets.icon);
    const iconType = pbivizJson.assets.icon.indexOf('.svg') >= 0 ? 'svg+xml' : 'png';
    const iconBase64 = `data:image/${iconType};base64,` + icon.toString('base64');

    pbivizJson.capabilities = capabilities;
    pbivizJson.content = {
        js: jsContent,
        css: cssContent,
        iconBase64: iconBase64
    };
    pbivizJson.visual.version = packageJson.version;

    zip.file('package.json', JSON.stringify(buildPackageJson, null, 2));
    zip.file(`resources/${pbivizJson.visual.guid}.pbiviz.json`, JSON.stringify(pbivizJson, null, 2));
    fs.writeFileSync(pbivizJson.output, zip.generate({ base64:false,compression:'DEFLATE' }), 'binary');
};

const buildPackage = () => {
    mkdirp.sync(path.parse(pbivizJson.output).dir);
    compileScripts((err, result, ossReport) => {
        if (err) throw err;

        if (!pbivizJson.apiVersion) {
            _buildLegacyPackage(result);
        } else {
            _buildPackage(result);
        }

        const ossReportFile = path.join(path.dirname(pbivizJson.output), pbivizJson.visual.name + '_' + packageJson.version + '_OSS_Report.csv');
        fs.writeFileSync(ossReportFile, ossReport);
    });
};

buildPackage();
