import { series, watch } from 'gulp'
import { browserSync as browserSyncParams } from './gulp/parameters'
import { task as htmlTask, html as handleHtml, htmlIndexer } from './gulp/tasks/html.task'
import { task as scriptTask, script as scriptsHandle } from './gulp/tasks/scripts.task'
import { task as styleTask, style as stylesHandle } from './gulp/tasks/styles.task'
import HtmlStructure from './gulp/plugins/HtmlStructure'
import { realname } from './gulp/helpers'
import bsync from 'browser-sync'

global.reload = bsync.reload

let taskNames = []
let filesHTMLIndex = {}
let filesScripts = []
let filesStyles = []

function build() {
    const structures = (new HtmlStructure('pages/**/*.html')).files

    for (const structure of structures) {
        taskNames.push(handleHtml(structure))
        filesHTMLIndex = htmlIndexer(structure, filesHTMLIndex)

        const script = scriptTask(realname(structure.name), structure.assets.scripts)

        if (script !== null) {
            taskNames.push(script.taskname)
            for (const sf of script.files) {
                if (!filesScripts.includes(sf)) {
                    filesScripts.push(sf)
                }
            }
        }

        const style = styleTask(realname(structure.name), structure.assets.links)
        
        if (style !== null) {
            taskNames.push(style.taskname)
            for (const cf of style.files) {
                if (!filesStyles.includes(cf)) {
                    filesStyles.push(cf)
                }
            }
        }
    }
}

build()

function watcher(cb) {
    watch(Object.keys(filesHTMLIndex)).on('change', (filepath, stats) => {
        let parents = filesHTMLIndex[filepath];

        if (parents === null) {
            parents = [filepath]
        }

        return htmlTask(parents)()
    })

    watch(filesScripts).on('change', (filepath, stats) => {
        return scriptsHandle([filepath])()
    })

    console.log(filesStyles)
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
