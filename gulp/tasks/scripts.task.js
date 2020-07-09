import { relative} from 'path'
import { webpack as webpackParams } from './../parameters'
import { src, dest, task as gulpTask } from 'gulp';
import { sourcePath, isDevelop, scriptsPath, basePath } from '../helpers'
import { init, write } from 'gulp-sourcemaps'
import { reload } from 'browser-sync'
import gulpIf from 'gulp-if';
import rename from 'gulp-rename'
import compileWebpack from './../plugins/compileWebpack'
import {
    sourcemap,
    rename as renameParams
} from './../parameters'


function task(files = [], target = '') {
    return (cb) => {
        files = files.map(item => relative(basePath(), item))

        return src(files, {root: basePath()})
            .pipe(init(sourcemap.init))
            .pipe(compileWebpack(webpackParams))
            .pipe(rename(renameParams))
            .pipe(write(sourcemap.write))
            .pipe(dest(scriptsPath(target)))
            .pipe(reload({ stream: true }))
    }
}

function script(name, scripts = []) {
    const taskname = `${name}::scripts`
    const files = scripts.filter(
        (item) => item.path.includes(sourcePath())
    ).map((item) => item.path)

    if (files.length === 0) return null

    gulpTask(taskname, task(files, ''))

    return { taskname, files }
}

function indexer(files, bucket) {
    for (const file of files) {
        if (!bucket.includes(file)) {
            bucket.push(file)
        }
    }

    return bucket
}

export { script, task, indexer }