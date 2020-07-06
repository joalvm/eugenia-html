import { src, dest } from 'gulp';
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

export default function scss(cb) {
    return src(sourcePath('pages/**/*.scss'))
        .pipe(gulpIf(isDevelop(), sourcemapInit(sourcemap.init)))
        .pipe(sass(sassParams).on('error', sass.logError))
        .pipe(rename(renameParams))
        .pipe(autoPrefixer(autoPrefixerParams))
        .pipe(gulpIf(isDevelop(), sourcemapWrite(sourcemap.write)))
        .pipe(dest(targetPath('static/css')))
}