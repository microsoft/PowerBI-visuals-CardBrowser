const fs = require('fs-extra');
const { execSync } = require('child_process');

const subModules = require("../package.json").privateSubmodules;

Object.entries(subModules).forEach(entry => {
    const [name, version] = entry;
    console.log(`Installing ${name}@${version}...`);
    try {
        execSync(`yarn add ${name}@${version} --no-lockfile --ignore-scripts`);
        fs.ensureDirSync(`lib/${name}`);
        fs.moveSync(`node_modules/${name}`, `lib/${name}`, { overwrite: true });
        execSync(`yarn remove ${name}`);
    } catch (e) {
        console.log(e.message);
    }
});
