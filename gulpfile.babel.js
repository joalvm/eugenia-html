import { series, watch } from 'gulp'
import { browserSync as browserSyncParams } from './gulp/parameters'
import { task as htmlTask, html, htmlIndexer } from './gulp/tasks/html.task'
import { task as scriptTask, script as scriptsHandle } from './gulp/tasks/scripts.task'
import { task as styleTask, style as stylesHandle } from './gulp/tasks/styles.task'
import { EstructureApp } from './gulp/plugins/preprocessor'
import { realname } from './gulp/helpers'
import bsync from 'browser-sync'

global.reload = bsync.reload

let taskNames = []
let filesHTMLIndex = {}
let filesScripts = []
let filesStyles = []

function build() {
    const structures = (new EstructureApp('pages/**/*.html')).files

    for (const structure of structures) {
        taskNames.push(htmlTask(structure))
        filesHTMLIndex = htmlIndexer(structure, filesHTMLIndex)

        const script = scriptTask(realname(structure.name), structure.assets.scripts)

        if (script !== null) {
            taskNames.push(script.taskname)
            filesScripts = script.files
        }

        const style = styleTask(realname(structure.name), structure.assets.links)

        if (style !== null) {
            taskNames.push(style.taskname)
            filesStyles = style.files
        }
    }
}

build()

function watcher(cb) {
    watch(Object.keys(filesHTMLIndex)).on('change', (filepath, stats) => {
        const parents = filesHTMLIndex[filepath];

        if (parents !== null) {
            for (const parent of parents) {
                return html(parents)()
            }
        } else {
            return html(filepath)()
        }
    })

    watch(filesScripts).on('change', (filepath, stats) => {
        return scriptsHandle([filepath])()
    })

    watch(filesStyles).on('change', (filepath, stats) => {
        return stylesHandle([filepath])()
    })

    cb()
}

function browserSync(cb) {
    bsync(browserSyncParams)

    cb()
}

exports.default = series([...taskNames, watcher, browserSync])
