import {src, dest} from 'gulp'
import glob from 'glob'
import prettify from 'gulp-html-prettify'
import gulpIf from 'gulp-if';
import { isDevelop, sourcePath, targetPath } from '../helpers';
import htmlmin from 'gulp-htmlmin';
import { preprocessor } from './../plugins/preprocessor'

export default function html(cb) {
  return src(glob.sync(sourcePath('pages/**/*.html')))
      .pipe(preprocessor())
      .pipe(gulpIf(isDevelop(), prettify(), htmlmin({ collapseWhitespace: true })))
      .pipe(dest(targetPath('public')))
}