import { src, dest, task as GulpTask, watch as GulpWatch } from 'gulp'
import { env, sourcePath, basePath, staticPath } from '../helpers'
import { relative } from 'path'
import { sync } from 'glob'

export default class {
  constructor() {
    this.path = env('input.assets', 'assets')
    this.pattern = sourcePath(`${this.path}/**/*.*`)
    this.files = sync(this.pattern, {dot: true})
  }

  tasker() {
    const taskname = 'assets::files'

    GulpTask(taskname, this.task(this.files))

    return taskname;
  }

  task(files = [], target = '') {
    return (cb) => {
      return src(
        files.map((file) => relative(basePath(), file)),
        {base: sourcePath(this.path)}
      ).pipe(dest(staticPath()))
    }
  }

  watchers(cb) {
    GulpWatch(this.pattern)
      .on('change', this._onChange(cb))
      .on('add', this._onChange(cb))
  }

  _onChange(cb) {
    return (filepath, stats) => {
      return this.task([filepath])(cb)
    }
  }
}
