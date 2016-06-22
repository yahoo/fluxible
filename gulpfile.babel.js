import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import {cd, exec, rm} from 'shelljs';
import {argv} from 'yargs';
import babel from 'gulp-babel';

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
packages['fluxible.io'] = path.resolve(PACKAGES_PATH, '..', 'site');
packages['fluxible-examples'] = path.resolve(PACKAGES_PATH, '..', 'examples');

const sharedDeps = [
    'react',
    'react-dom'
];
gulp.task('install', () => {
    return Promise.all(
        // Link all packages to the root
        Object.keys(packages).map((packageName) => {
            return new Promise((resolve) => {
                cd(packages[packageName]);
                exec('npm link');
                cd(ROOT_PATH);
                exec('npm link ' + packageName);
                resolve();
            });
        })
    ).then(() => {
        // Remove duplicated packages and shared dependencies so they are loaded
        // from the top
        return Promise.all(
            Object.keys(packages).map((packageName) => {
                return Promise.all(
                    Object.keys(packages).concat(sharedDeps).map((dependencyName) => {
                        return new Promise((resolve) => {
                            rm('-rf', path.resolve(packages[packageName], 'node_modules', dependencyName));
                            resolve();
                        });
                    })
                );
            })
        );
    });
});

gulp.task('dist', () => {
    let pwd = process.env.PWD;
    let pwdPackageName = Object.keys(packages).reduce((prev, name) => {
        return packages[name] === pwd ? name : prev;
    }, undefined);
    let packageName = argv.pkg || argv.p || pwdPackageName;
    if (!packageName) {
        throw new Error('Usage: gulp dist -p <package>');
    }
    var src = packages[packageName] + '/src/**/*';
    var dest = path.resolve(packages[packageName], 'dist')
    rm('-rf', dest);
    gulp.src(src)
        .pipe(babel({
            babelrc: false,
            presets: ['es2015', 'react'],
            plugins: ['transform-class-properties']
        }))
        .pipe(gulp.dest(dest))
});

gulp.task('clean', () => {
    // Remove package node_modules
    return Promise.all(
        Object.keys(packages).map((packageName) => {
            return new Promise((resolve) => {
                rm('-rf', path.resolve(packages[packageName], 'node_modules'));
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
    if (!packageName || !version) {
        throw new Error('Usage: gulp version -p <package> -v <version>');
    }

    // Bump the version
    cd(packages[packageName]);
    let execResult = exec('npm version ' + version);
    let bumpedVersion = execResult.stdout.replace('\n', '').replace('v', '');

    // Commit and tag
    exec('git add ' + packages[packageName] + '/package.json');
    let message = packageName + '@' + bumpedVersion;
    exec('git commit -m "' + message + '"');
    let tagName = packageName + '-v' + bumpedVersion;
    exec('git tag ' + tagName);
});

gulp.task('publish', () => {
    // Try to derive package name from directory where this was run from
    let pwd = process.env.PWD;
    let pwdPackageName = Object.keys(packages).reduce((prev, name) => {
        return packages[name] === pwd ? name : prev;
    }, undefined);

    // Check params
    let packageName = argv.pkg || argv.p || pwdPackageName;
    if (!packageName) {
        throw new Error('Usage: gulp publish -p <package>');
    }

    // Publish
    cd(packages[packageName]);
    exec('npm publish');
});

