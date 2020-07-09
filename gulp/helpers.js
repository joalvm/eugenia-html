import { normalize, resolve, relative, dirname, basename } from 'path'
import { readFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'

require('dotenv').config()

export function env (key, _default = null) {
    return process.env[key] || _default
}

export function isDevelop() {
    return env('APP_ENV') === 'development'
}

export function basePath(path = '') {
    return resolve(
        normalize(resolve(__dirname, '..')),
        normalize(path)
    )
}

export function sourcePath(path) {
    return resolve(
        normalize(resolve(__dirname, '..')),
        normalize(
            path 
                ? resolve(env('SOURCE_PATH'), path)
                : env('SOURCE_PATH')
        )
    )
}

export function targetPath(path) {
    return resolve(
        normalize(resolve(__dirname, '..')),
        normalize(
            path 
                ? resolve(env('TARGET_PATH', 'dist'), path)
                : env('TARGET_PATH', 'dist')
        )
    )
}

export function publicPath(path = '') {
    return resolve(
        targetPath(env('OUTPUT_PUBLIC_PATH', './')),
        normalize(path)
    )
}

export function staticPath(path = '') {
    return resolve(
        targetPath(env('OUTPUT_ASSETS_DIRECTORY', 'static')),
        normalize(path)
    )
}

export function htmlPath(path = '') {
    return resolve(
        targetPath(env('OUTPUT_PUBLIC_DIRECTORY')),
        normalize(path)
    )
}

export function scriptsPath(path = '') {
    return resolve(
        staticPath(env('OUTPUT_SCRIPTS_DIRECTORY')),
        normalize(path)
    )
}

export function stylesPath(path = '') {
    return resolve(
        staticPath(env('OUTPUT_STYLES_DIRECTORY')),
        normalize(path)
    )
}

export function normalizePath(path, basePath) {
    return resolve(normalize(dirname(basePath)), normalize(path))
}

/**
 * Obtiene el nombre de un archivo sin la extensión
 * @param {string} path filename
 */
export function realname(path) {
    return basename(path.split('.').slice(0, -1).join('.'));
}

export function getFile(path, basePath = '') {
    return readFileSync(
        basePath ? normalizePath(path, basePath) : path
    ).toString()
}

export function normalizeScriptPath(mainPath = '') {
    const path = relative(htmlPath(), scriptsPath())
    const filename = basename(mainPath).replace('.ts', '.js')

    if (mainPath.match(/node_modules/gi)) {
        copyAsset(mainPath, scriptsPath(filename))
    }

    return `./${path}/${filename}`
}

export function normalizeStylePath(mainPath = '') {
    const path = relative(htmlPath(), stylesPath())
    const filename = basename(mainPath).replace('.scss', '.css')

    if (mainPath.match(/node_modules/gi)) {
        copyAsset(mainPath, stylesPath(filename))
    }

    return `./${path}/${filename}`
}

export function copyAsset(from = '', to = '') {
    if (!existsSync(to)) {
        if (!existsSync(dirname(to))) {
            mkdirSync(dirname(to), {recursive: true})
        }

        copyFileSync(from, to)

        const map = `${from}.map`;

        if (existsSync(map) && isDevelop()) {
            copyFileSync(map, `${to}.map`)
        }
    }
}