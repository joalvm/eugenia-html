import { src, dest } from 'gulp';
import { sourcePath, isDevelop, targetPath } from '../helpers'
import rename from 'gulp-rename'
import { init, write } from 'gulp-sourcemaps'
import webpack from 'webpack-stream'
import named from 'vinyl-named'
import gulpIf from 'gulp-if';
import {
    sourcemap,
    rename as renameParams, 
    webpack as webpackParams
} from './../parameters'

export default function typescript() {
    return src(sourcePath('pages/**/*.ts'))
        .pipe(gulpIf(isDevelop(), init(sourcemap.init)))
        .pipe(named())
        .pipe(webpack(webpackParams))
        .pipe(rename(renameParams))
        .pipe(gulpIf(isDevelop(), write(sourcemap.write)))
        .pipe(dest(targetPath('static/js')))
}