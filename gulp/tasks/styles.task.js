import { src, dest, task as GulpTask, watch as GulpWatch } from 'gulp';
import { init as sourcemapInit, write as sourcemapWrite } from 'gulp-sourcemaps'
import { sourcePath, isDevelop, stylesPath } from '../helpers'
import { reload } from 'browser-sync'
import sass from 'gulp-sass'
import gulpIf from 'gulp-if';
import rename from 'gulp-rename';
import autoPrefixer from 'gulp-autoprefixer'
import Structure from './../Components/Structure'
import {
  autoprefixer as autoPrefixerParams,
  sourcemap,
  sass as sassParams,
  rename as renameParams
} from '../parameters'

export default class Styles {
  /**
   *
   * @param {Structure} structure
   */
  constructor(structure) {
    this.structure = structure
    this.index = []
  }

  tasker(name) {
    const taskname = this._createName(name)
    const files = this._getFiles(name)

    if (files.length === 0) {
      return null
    }

    for (const file of files) {
      if (!this.index.includes(file)) {
        GulpTask(taskname, this.task(file))
      }
    }

    this._indexer(files)

    return taskname
  }

  task(file, target = '') {
    return (cb) => {
      return src(file)
        .pipe(gulpIf(isDevelop(), sourcemapInit(sourcemap.init)))
        .pipe(sass(sassParams).on('error', sass.logError))
        .pipe(rename(renameParams))
        .pipe(autoPrefixer(autoPrefixerParams))
        .pipe(gulpIf(isDevelop(), sourcemapWrite(sourcemap.write)))
        .pipe(dest(stylesPath(target)))
        .pipe(reload({ stream: true }))
    }
  }

  watchers(cb) {
    GulpWatch(this.index).on('change', this._onChange(cb))
  }

  _onChange(cb) {
    return (filepath, stats) => {
      return this.task(filepath)(cb)
    }
  }

  _indexer(files = []) {
    for (const file of files) {
      if (!this.index.includes(file)) {
        this.index.push(file)
      }
    }
  }

  _createName(name) {
    return `${name}::styles`
  }

  _getFiles(name) {
    return this.structure.getSchema(name).assets.links
      .filter((item) => item.path.includes(sourcePath()))
      .map((item) => item.path)
  }
}
