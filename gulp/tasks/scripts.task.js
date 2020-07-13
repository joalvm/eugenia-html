import { relative } from 'path'
import { webpack as webpackParams, src as srcParams, rename as renameParams } from './../parameters'
import { src, dest, task as GulpTask, watch as GulpWatch } from 'gulp';
import { sourcePath, isDevelop, scriptsPath, basePath } from '../helpers'
import { reload } from 'browser-sync'
import compileWebpack from './../plugins/compileWebpack'
import Structure from './../Components/Structure'
import gulpIf from 'gulp-if';
import terser from 'gulp-terser'
import plumber from 'gulp-plumber'
import rename from 'gulp-rename'

export default class Scripts {
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
      return src(relative(basePath(), file), srcParams)
        .pipe(plumber())
        .pipe(compileWebpack(webpackParams))
        .pipe(gulpIf(!isDevelop(), terser()))
        .pipe(rename(renameParams))
        .pipe(plumber.stop())
        .pipe(dest(scriptsPath(target)))
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
    return `${name}::scripts`
  }

  _getFiles(name) {
    return this.structure.getSchema(name).assets.scripts
      .filter((item) => item.path.includes(sourcePath()))
      .map((item) => item.path)
  }
}
