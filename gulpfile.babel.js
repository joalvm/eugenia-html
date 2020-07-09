import { series, watch, task, src, dest } from 'gulp'
import { browserSync as browserSyncParams } from './gulp/parameters'
import { realname, sourcePath, publicPath, basePath } from './gulp/helpers'
import { relative } from 'path'
import bsync from 'browser-sync'
import gulpCopy from 'gulp-copy'
import { sync as globSync } from 'glob'
import { task as htmlTask, html as handleHtml, htmlIndexer } from './gulp/tasks/html.task'
import {
    task as scriptTask,
    script as handleScript,
    indexer as scriptIndexer
} from './gulp/tasks/scripts.task'

import {
    task as styleTask,
    style as handleStyle,
    indexer as styleIndexer
} from './gulp/tasks/styles.task'

import HtmlStructure from './gulp/plugins/HtmlStructure'

let taskNames = []
let filesHTMLIndex = {}
let filesScriptsIndex = []
let filesStylesIndex = []
let filesImages = []
const filesPublic = [
    ...globSync(relative(basePath(), sourcePath('public/**/*.*'))),
    ...globSync(relative(basePath(), sourcePath('public/**/.*')))
]

function build() {
    const structures = (new HtmlStructure('pages/**/*.html')).files

    for (const structure of structures) {
        const taskName = realname(structure.name)
        let tasks = []

        taskNames.push(handleHtml(structure))
        filesHTMLIndex = htmlIndexer(structure, filesHTMLIndex)

        // MANEJO DE LOS SCRIPTS
        const script = handleScript(taskName, structure.assets.scripts)
        if (script !== null) {
            taskNames.push(script.taskname)
            filesScriptsIndex = scriptIndexer(script.files, filesScriptsIndex)
        }

        const style = handleStyle(taskName, structure.assets.links)
        if (style !== null) {
            taskNames.push(style.taskname)
            filesStylesIndex = styleIndexer(style.files, filesStylesIndex)
        }
    }
}

build()

function publicFiles() {
    return src(filesPublic)
        .pipe(dest(publicPath()))
}


function watcher(cb) {
    watch(Object.keys(filesHTMLIndex)).on('change', (filepath, stats) => {
        let parents = filesHTMLIndex[filepath];

        if (parents === null) {
            parents = [filepath]
        }

        return htmlTask(parents)()
    })

    watch(filesScriptsIndex).on('change', (filepath, stats) => {
        return scriptTask([filepath])(cb)
    })

    watch(filesStylesIndex).on('change', (filepath, stats) => {
        return styleTask([filepath])(cb)
    })

    cb()
}

function browserSync(cb) {
    bsync(browserSyncParams)

    cb()
}

exports.prod = series([...taskNames, publicFiles])
exports.default = series([...taskNames, publicFiles, watcher, browserSync])
