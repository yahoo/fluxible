import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import {cd, exec} from 'shelljs';
import {argv} from 'yargs';

const ROOT_PATH = path.resolve(__dirname);
const PACKAGES_PATH = path.resolve(__dirname, './packages');
const packages = fs.readdirSync(PACKAGES_PATH).filter((file) => {
    return fs.statSync(path.resolve(PACKAGES_PATH, file)).isDirectory();
}).reduce((acc, file) => {
    return {
        ...acc,
        [file]: path.resolve(PACKAGES_PATH, file)
    };
}, {});

gulp.task('install', () => {
    return Promise.all(
        Object.keys(packages).map((packageName) => {
            return new Promise((resolve) => {
                cd(packages[packageName]);
                exec('npm link');
                cd(ROOT_PATH);
                exec('npm link ' + packageName);
                resolve();
            });
        })
    );
});

gulp.task('version', () => {
    // Try to derive package name from directory where this was run from
    let pwd = process.env.PWD;
    let pwdPackageName = Object.keys(packages).reduce((prev, name) => {
        return packages[name] === pwd ? name : prev;
    }, undefined);

    // Check params
    let packageName = argv.pkg || argv.p || pwdPackageName;
    let version = argv.version || argv.v;
    let message = argv.message || argv.m || packageName + '@%s';
    if (!packageName || !version) {
        throw new Error('Usage: gulp version -p <package> -v <version>');
    }

    // Bump the version
    cd(packages[packageName]);
    exec('npm version ' + version + ' -m "' + message + '"');

    // Rename tags to have package name prefix
    let tagName = 'v' + version;
    let newTagName = packageName + '-v' + version;
    exec('git tag ' + newTagName + ' ' + tagName);
    exec('git tag -d ' + tagName);
});

