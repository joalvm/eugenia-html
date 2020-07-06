import { normalize, resolve, relative } from 'path'

require('dotenv').config()

export function env (key, _default = null) {
    return process.env[key] || _default
}

export function isDevelop() {
    return env('APP_ENV') === 'development'
}

export function sourcePath (path) {
    return relative(
        normalize(resolve(__dirname, '..')),
        resolve(env('SOURCE_PATH'), path)
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