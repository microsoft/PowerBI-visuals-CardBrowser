/**
 * Copyright (c) 2018 Uncharted Software Inc.
 * http://www.uncharted.software/
 */

const fs = require('fs');
const fileTools = require('./fileTools.js');
const path = require('path');

/**
 * Finds the contents at the given path and creates symlinks to them in `node_modules`.
 *
 * @method createSymLinks
 * @param {String} modPath - The absolute path to the folder containing the objects to be linked.
 * @returns {Promise}
 */
function createSymLinks(modPath) {
    const promises = [];
    const modulesPath = path.resolve(__dirname, '../node_modules/');
    if (!fileTools.pathExists(modulesPath)) {
        fileTools.createFilePath(modulesPath);
    }

    fileTools.findEntriesInFolder(modPath, (fullEntry, entry) => {
        const linkType = fs.lstatSync(fullEntry).isDirectory() ? 'dir' : 'file';
        const linkPath = path.join(modulesPath, entry);
        const relativeSourcePath = path.relative(modulesPath, fullEntry);

        promises.push(new Promise( resolve => {
            fs.symlink(relativeSourcePath, linkPath, linkType, resolve);
        }));
    });
    return Promise.all(promises);
}

return createSymLinks(path.resolve(__dirname, '../lib/'));
