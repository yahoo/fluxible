import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import {cd, exec} from 'shelljs';

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

