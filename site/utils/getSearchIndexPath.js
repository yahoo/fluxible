'use strict';

export default function getSearchIndexPath() {
    let path = process.cwd() + '/build/search.json';
    if (process.env.manhattan_context__cache_dir) {
        path = process.env.manhattan_context__cache_dir + '/fluxible.search.json';
    }
    return path;
}
