import { src, dest, task as gulpTask } from 'gulp'
import { isDevelop, realname, targetPath } from '../helpers';
import { preprocessor, processAsset } from '../plugins/handleHtmlScripts'
import { reload } from 'browser-sync'
import rename from 'gulp-rename';
import gulpIf from 'gulp-if';
import htmlmin from 'gulp-htmlmin';
import prettify from 'gulp-html-prettify'

function isHome(file) {
  return file.basename === 'home.html';
}

function htmlIndexer(structure, filesHTMLIndex) {
  // Cuando en el watch se detecta como null, representa a un archivo principal
  filesHTMLIndex[structure.path] = null

  // indexando el template
  if (filesHTMLIndex.hasOwnProperty(structure.template)) {
    filesHTMLIndex[structure.template].push(structure.path)
  } else {
    filesHTMLIndex[structure.template] = [structure.path]
  }

  for (const file of structure.includes) {
    // indexando los includes
    if (filesHTMLIndex.hasOwnProperty(file)) {
      filesHTMLIndex[file].push(structure.path)
    } else {
      filesHTMLIndex[file] = [structure.path]
    }
  }

  return filesHTMLIndex
}

function task(filepath, target = '') {
  return (cb) => {
    return src(filepath)
      .pipe(preprocessor())
      .pipe(gulpIf(isDevelop(), prettify(), htmlmin({ collapseWhitespace: true })))
      .pipe(gulpIf(isHome, rename('index.html')))
      .pipe(dest(targetPath(`${target}`)))
      .pipe(processAsset({ min: !isDevelop() }))
      .pipe(reload({ stream: true }))
  }
}

function html(obj) {
  const taskname = realname(obj.name) + '::html'
  gulpTask(taskname, task(obj.path, ''))
  return taskname
}

export { task, html, htmlIndexer }
