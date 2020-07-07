import { normalize, resolve, relative, dirname, basename } from 'path'
import { readFileSync } from 'fs'

require('dotenv').config()

export function env (key, _default = null) {
    return process.env[key] || _default
}

export function isDevelop() {
    return env('APP_ENV') === 'development'
}

export function basePath(path) {
    return relative(
        normalize(resolve(__dirname, '..')),
        normalize(path)
    )
}

export function sourcePath(path) {
    return relative(
        normalize(resolve(__dirname, '..')),
        normalize(
            path 
                ? resolve(env('SOURCE_PATH'), path)
                : env('SOURCE_PATH')
        )
    )
}

export function targetPath(path) {
    return relative(
        normalize(resolve(__dirname, '..')),
        normalize(
            path 
                ? resolve(env('TARGET_PATH'), path)
                : env('TARGET_PATH')
        )
    )
}

export function normalizePath(path, basePath) {
    return resolve(normalize(dirname(basePath)), normalize(path))
}

export function realname(path) {
    return basename(path.split('.').slice(0, -1).join('.'));
}

export function getFile(path, basePath = '') {
    return readFileSync(
        basePath ? normalizePath(path, basePath) : path
    ).toString()
}
