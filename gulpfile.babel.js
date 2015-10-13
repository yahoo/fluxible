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
    let packageName = argv.pkg || argv.p;
    let version = argv.version || argv.v;
    if (!packageName || !version) {
        throw new Error('pkg and version required');
    }
    cd(packages[packageName]);
    exec('npm version ' + version);
});

gulp.task('post-version', () => {
    let packageName = process.env.npm_package_name;
    let packageVersion = process.env.npm_package_version;

    // Rename tags to have package name prefix
    let tagName = 'v' + packageVersion;
    let newTagName = packageName + '-v' + packageVersion;
    exec('git tag ' + newTagName + ' ' + tagName);
    exec('git tag -d ' + tagName);
});

