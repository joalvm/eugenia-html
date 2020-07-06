import { resolve, normalize, dirname } from 'path'
import { readFileSync } from 'fs'
import through2 from 'through2'


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

export class HtmlPreprocessor {
    constructor(context) {
        this.resourceContext = context
    }

    build(content) {
        return this.template(content.trim())
    }

    template(content) {
        const mainRegEx = /<main(.*)?></gm;
        const search = /@template\((\w+|.+|\/)\)/gm.exec(content)

        content = this.includes(
            this.resourceContext,
            content.replace(search[0], '').trim()
        );

        const filename = this.normalizePath(this.resourceContext, search[1]);

        return this.includes(
            filename,
            this.getFile(this.resourceContext, search[1])
                .replace(mainRegEx, `<main>${content}<`)
        )
    }

    includes(currentPath, html) {
        const regex = /@include\((.+|\/|\w+)\)/gm
        let m

        while ((m = regex.exec(html)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            const filename = this.normalizePath(currentPath, m[1]);

            html = html.replace(
                m[0],
                this.includes(filename, this.getFile(currentPath, m[1]))
            )
        }

        return html.trim();
    }

    getFile(mainPath, search) {
        return readFileSync(
            this.normalizePath(mainPath, search)
        ).toString()
    }

    normalizePath(mainPath, search) {
        return resolve(normalize(dirname(mainPath)), normalize(search))
    }
}
