import { series, task as GulpTask } from 'gulp'
import { targetPath, env } from './gulp/helpers'
import del from 'del'

import StructureComponent from './gulp/Components/Structure'
import Html from './gulp/tasks/html.task'
import Scripts from './gulp/tasks/scripts.task'
import Styles from './gulp/tasks/styles.task'
import server from './gulp/tasks/server.task'
import Publics from './gulp/tasks/public.task'
import Assets from './gulp/tasks/assets.task'

let structure = new StructureComponent(env('input.pages', 'pages'))

const otherTasks = []

const html = new Html(structure)
const scripts = new Scripts(structure)
const styles = new Styles(structure)
const publics = new Publics()
const assets = new Assets()

for (const [name] of Object.entries(structure.schema)) {
  const tasks = [
    html.tasker(name),
    scripts.tasker(name),
    styles.tasker(name)
  ]

  GulpTask(
    name,
    series(...(tasks.filter((taskname) => taskname !== null)))
  )
}

otherTasks.push(publics.tasker())
otherTasks.push(assets.tasker())

function clean(cb) {
    del.sync([targetPath('./')])
    cb()
}

function watcher(cb) {
  html.watchers(cb)
  scripts.watchers(cb)
  styles.watchers(cb)
  publics.watchers(cb)
  assets.watchers(cb)
}

export const start = series(
  ...Object.keys(structure.schema),
  ...otherTasks,
  server,
  watcher
)

export const build = series(
  clean,
  ...Object.keys(structure.schema),
  ...otherTasks,
)
