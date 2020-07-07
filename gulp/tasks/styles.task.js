import { src, dest, task as gulpTask } from 'gulp';
import { sourcePath, isDevelop, targetPath } from '../helpers'
import sass from 'gulp-sass'
import gulpIf from 'gulp-if';
import rename from 'gulp-rename';
import autoPrefixer from 'gulp-autoprefixer';
import {
    autoprefixer as autoPrefixerParams,
    sourcemap,
    sass as sassParams,
    rename as renameParams
} from '../parameters'
import {
    init as sourcemapInit,
    write as sourcemapWrite
} from 'gulp-sourcemaps'
import { reload } from 'browser-sync';

function style(files, target = '') {
    return (cb) => {
        return src(files)
            .pipe(gulpIf(isDevelop(), sourcemapInit(sourcemap.init)))
            .pipe(sass(sassParams).on('error', sass.logError))
            .pipe(rename(renameParams))
            .pipe(autoPrefixer(autoPrefixerParams))
            .pipe(gulpIf(isDevelop(), sourcemapWrite(sourcemap.write)))
            .pipe(dest(targetPath(`static/css/${target}`)))
            .pipe(reload({stream: true}))
    }
}

function task(name, styles) {
    const taskname = `${name}::styles`
    const files = styles
        .filter((item) => item.path.includes(sourcePath()))
        .map((item) => item.path);

    if (files.length === 0) {
        return null
    }
    console.log(files)
    gulpTask(taskname, style(files, ''))

    return {taskname, files};
}

export { style, task }