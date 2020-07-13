import { browserSync as browserSyncParams } from './../parameters'
import bsync from 'browser-sync'

export default function server(cb) {
    bsync(browserSyncParams)

    cb()
}