import { src, dest, task as gulpTask } from 'gulp';
import { sourcePath, isDevelop, targetPath } from '../helpers'
import rename from 'gulp-rename'
import { init, write } from 'gulp-sourcemaps'
import webpack from 'webpack-stream'
import named from 'vinyl-named'
import gulpIf from 'gulp-if';
import { reload } from 'browser-sync'
import {
    sourcemap,
    rename as renameParams,
    webpack as webpackParams
} from './../parameters'

function script(files = [], target = '') {
    return (cb) => {
        return src(files)
            .pipe(gulpIf(isDevelop(), init(sourcemap.init)))
            .pipe(named())
            .pipe(webpack(webpackParams))
            .pipe(rename(renameParams))
            .pipe(gulpIf(isDevelop(), write(sourcemap.write)))
            .pipe(dest(targetPath(`static/js/${target}`)))
            .pipe(reload({ stream: true }))
    }
}

function task(name, scripts) {
    const taskname = `${name}::scripts`
    const files = scripts
        .filter((item) => item.path.includes(sourcePath()))
        .map((item) => item.path);

    if (files.length === 0) {
        return null
    }

    gulpTask(taskname, script(files, ''))

    return { taskname, files };
}

export { script, task }