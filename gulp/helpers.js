import { normalize, resolve, relative, dirname, basename } from 'path'
import { readFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import config from './../config'
import { get } from 'lodash'

require('dotenv').config()

export function env(key, _default = null) {
    return get(config, key, _default)
}

export function isUrl(str) {
    return /^http(s)?:\/\/(.+)\.(\w+)$/gi.test(str)
}

export function environment() {
    return process.argv
        .slice(3)
        .includes('--production') ? 'production' : 'development'
}

export function isDevelop() {
    return environment() === 'development'
}

/**
 * Raiz del proyecto.
 * @param {string} path 
 */
export function basePath(path = '') {
    return resolve(
        normalize(resolve(__dirname, '..')),
        normalize(path)
    )
}

/**
 * Directorio donde estan los archivos de desarrollo.
 * @param {string} path 
 */
export function sourcePath(path = '') {
    return resolve(
        normalize(resolve(__dirname, '..')),
        normalize(
            path ? resolve(env('source'), path) : env('source')
        )
    )
}

/**
 * verifica la existencia del nombre del template y su archivo principal
 * @param {string} name 
 */
export function templatePath(name = '') {
    let path = sourcePath(env('input.templates', 'templates') + `/${name}`)

    if (!existsSync(path)) {
        return null
    }

    const first = `${path}/index.html`
    const second = `${path}/${name}.html`

    if (existsSync(first)) {
        return first
    } else if (existsSync(second)) {
        return second
    } else {
        return null
    }
}

/**
 * Directorio de distribución para los archivos transpilados
 * @param {string} path 
 */
export function targetPath(path = '') {
    return resolve(
        normalize(resolve(__dirname, '..')),
        normalize(
            path
                ? resolve(env('target', 'dist'), path)
                : env('target', 'dist')
        )
    )
}

/**
 * Directorio publico de los archivos transpilados
 * @param {string} path 
 */
export function publicPath(path = '') {
    return resolve(
        targetPath(env('output.public_dir', '')),
        normalize(path)
    )
}

/**
 * Directorio de destino dentro del directorio de distribución
 * para los archivos estaticos js, css, img, fonts, etc.
 * @param {string} path 
 */
export function staticPath(path = '') {
    return resolve(
        targetPath(env('output.assets.name', 'static')),
        normalize(path)
    )
}

/**
 * Directorio de destino dentro del directorio de distribución
 * para los archivos javascript
 * @param {string} path 
 */
export function scriptsPath(path = '') {
    return resolve(
        staticPath(env('output.assets.directories.scripts')),
        normalize(path)
    )
}

/**
 * Directorio de destino dentro del directorio de distribución
 * para los archivos de estilo css
 * @param {string} path 
 */
export function stylesPath(path = '') {
    return resolve(
        staticPath(env('output.assets.directories.styles')),
        normalize(path)
    )
}

/**
 * Resuelve una ruta basandose en otra, normalizando a ambos primero
 * @param {string} path 
 * @param {string} basePath 
 */
export function resolvePath(path, basePath) {
    return resolve(normalize(dirname(basePath)), normalize(path))
}

/**
 * Obtiene el nombre de un archivo sin la extensión
 * @param {string} path filename
 */
export function realname(path) {
    return basename(path.split('.').slice(0, -1).join('.'));
}

/**
 * Obtiene el contenido de un archivo.
 * @param {string} path
 */
export function getFile(path = '') {
    return readFileSync(path, {encoding: 'utf8'}).toString()
}

export function normalizeScriptPath(mainPath = '') {
    const path = relative(publicPath(), scriptsPath())
    let filename = basename(mainPath).replace(
        '.ts',
        isDevelop() ? '.js' : '.min.js'
    )

    // Solo aquellos con ruta relativa son manipulados
    if (isUrl(mainPath)) {
        return mainPath
    }

    // Copia primero los assets que se encuentran en vendor
    if (mainPath.match(/node_modules/gi)) {
        filename = copyAsset(mainPath, scriptsPath(filename))
    }

    return `./${path}/${filename}`
}

export function normalizeStylePath(mainPath = '') {
    const path = relative(publicPath(), stylesPath())
    let filename = basename(mainPath).replace(
        '.scss',
        isDevelop() ? '.css' : '.min.css'
    )

    // Solo aquellos con ruta relativa son manipulados
    if (isUrl(mainPath)) {
        return mainPath
    }

    if (mainPath.match(/node_modules/gi)) {
        filename = copyAsset(mainPath, stylesPath(filename))
    }

    return `./${path}/${filename}`
}

export function copyAsset(from = '', to = '') {
    if (!existsSync(to)) {
        const fromMap = `${from}.map`
        const fromMin = from.replace(/\.js$/, '.min.js').replace(/\.css$/, '.min.css')
        const existsMin = existsSync(fromMin)

        if (!existsSync(dirname(to))) {
            mkdirSync(dirname(to), { recursive: true })
        }

        to = (existsMin && !isDevelop())
            ? to.replace(/\.js$/, '.min.js').replace(/\.css$/, '.min.css')
            : to

        copyFileSync((existsMin && !isDevelop()) ? fromMin : from, to)

        if (existsSync(fromMap) && isDevelop()) {
            copyFileSync(fromMap, `${to}.map`)
        }
    }

    return basename(to)
}

export function reportError(error) {
    try {
        console.log(['REPORT ERROR', error])
    } catch (ex) {

    }
}