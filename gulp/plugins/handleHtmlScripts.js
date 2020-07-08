import through2 from 'through2'
import HtmlPreprocessor from './HtmlPreprocessor'

export function preprocessor() {
    return through2.obj(function (file, enc, cb) {
        (async () => {
            file.contents = Buffer.from(
                (new HtmlPreprocessor(file.path)).build(file.contents.toString())
            )

            setImmediate(cb, null, file)
        })()
    })
}

export function processAsset(obj) {
    return through2.obj(function (file, enc, cb) {
        (async () => {
            setImmediate(cb, null, file)
        })()
    })
}

