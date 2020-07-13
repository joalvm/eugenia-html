import { src, dest, task as GulpTask, watch as GulpWatch } from 'gulp'
import { isDevelop, realname, env, publicPath } from '../helpers';
import { preprocessor } from '../plugins/handleHtmlScripts'
import { htmlmin as htmlminParams } from './../parameters'
import { reload } from 'browser-sync'
import rename from 'gulp-rename';
import gulpIf from 'gulp-if';
import htmlmin from 'gulp-htmlmin';
import prettify from 'gulp-html-prettify'
import Structure from './../Components/Structure'

export default class Html {
  /**
   * 
   * @param {Structure} structure 
   */
  constructor(structure) {
    this.structure = structure
    this.index = {}
    this.taskname = ''
  }

  tasker(name) {
    const taskname = this._createName(name)
    const path = this.structure.getSchema(name).path

    // Registramos la tarea
    GulpTask(taskname, this.task(path))
    
    this._indexer(name)

    return taskname
  }

  _indexer(name) {
    const path = this.structure.getSchema(name).path
    const template = this.structure.getSchema(name).template
    // Cuando en el watch se detecta como null, representa a un archivo principal
    this.index[path] = null
  
    // indexando el template
    if (this.index.hasOwnProperty(template)) {
      this.index[template].push(path)
    } else {
      this.index[template] = [path]
    }

    for (const file of this.structure.getSchema(name).includes) {
      // indexando los includes
      if (this.index.hasOwnProperty(file)) {
        this.index[file].push(path)
      } else {
        this.index[file] = [path]
      }
    }
  }

  task(file, target = '') {
    return (cb) => {
      return src(file)
        .pipe(preprocessor())
        .pipe(gulpIf(isDevelop(), prettify(), htmlmin(htmlminParams)))
        .pipe(gulpIf(this._isHome, rename('index.html')))
        .pipe(dest(publicPath(`${target}`)))
        .pipe(reload({ stream: true }))
    }
  }

  watchers(cb) {
    GulpWatch(Object.keys(this.index)).on('change', this._onChange(cb))
  }

  _onChange(cb) {
    return (filepath, stats) => {
      let parents = this.index[filepath];

      if (parents === null) {
        parents = [filepath]
      }

      return this.task(parents)(cb)
    }
  }

  _isHome(file) {
    return realname(file.basename) === env('output.index_page', 'home')
  }

  _createName(name) {
    return `${name}::html`
  }
}
