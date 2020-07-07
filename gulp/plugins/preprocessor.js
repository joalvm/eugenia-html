import { basename, resolve, dirname } from 'path'
import through2 from 'through2'
import { sourcePath, getFile, normalizePath, targetPath } from './../helpers'
import { sync } from 'glob'

const TEMPLATE_REGEX = /(?:<!--(?:\s+)?)?@template\((.+)\)(?:(?:\s+)?-->)?/gm
const INCLUDES_REGEX = /(?:<!--(?:\s+)?)?@include\((.+)\)(?:(?:\s+)?-->)?/gm
const ASSETS_REGEX = /(?:<(script|link)).+?(?:(?:src|href)(?:\s+)?=(?:\s+)?"(.+)").*?(?:\/)?(?:>)(?:<\/script>)?/gm

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

export class EstructureApp {
    constructor(pattern) {
        this.files = sync(sourcePath(pattern))
        .map((path) => {
            const filepath = normalizePath(path, sourcePath())
            const html = getFile(filepath)
            const templateMatch = this._getTemplatePath(html)
            let assets = {links: [], scripts: []}

            if (templateMatch === null) {
                return null;
            }

            const templatePath = normalizePath(templateMatch[1], filepath)
            const templateHtml = getFile(templatePath)

            this._getAssets(templateHtml, templatePath, assets)

            return {
                name: basename(path),
                path: filepath,
                template: templatePath,
                includes: this._getIncludePaths(html, filepath, assets),
                assets
            }
        }).filter((obj) => obj !== null)
    }
    
    _getTemplatePath(html = '') {
        return new RegExp(TEMPLATE_REGEX).exec(html);
    }

    _getIncludePaths(html = '', currentPath, assets) {
        const regEx = new RegExp(INCLUDES_REGEX)
        let matches
        let paths = []

        this._getAssets(html, currentPath, assets);

        while ((matches = regEx.exec(html)) !== null) {
            if (matches.index === regEx.lastIndex) {
                regEx.lastIndex++
            }

            const filename = normalizePath(matches[1], currentPath)
            
            paths = [
                filename,
                ...this._getIncludePaths(getFile(filename), filename, assets)
            ]
        }

        return paths
    }

    _getAssets(html = '', currentPath, assets) {
        const regex = new RegExp(ASSETS_REGEX)
        let matches;

        while ((matches = regex.exec(html)) !== null) {
            if (matches.index === regex.lastIndex) {
                regex.lastIndex++
            }

            const filepath = normalizePath(matches[2], currentPath)
            
            assets[`${matches[1]}s`].push({
                name: basename(filepath),
                path: filepath,
                tag: matches[0].replace(matches[2], filepath)
            })
        }
    }
}

export class HtmlPreprocessor {
    constructor(context) {
        this.resourceContext = context
    }

    build(content) {
        const mainRegEx = /<main(.*)?></gm
        const search = (new RegExp(TEMPLATE_REGEX)).exec(content.trim())
        const assets = {
            links: [],
            scripts: []
        }
        
        if (search === null) {
            return content
        }

        const filename = normalizePath(search[1], this.resourceContext);

        // Busca los archivos a incluir para el archivo actual
        content = this.includes(
            this.resourceContext,
            content.replace(search[0], '').trim(),
            assets
        );

        // agrega todo a la etiqueta <main> y busca si el template
        // tambien tiene archivos a incluir
        const full = this._insertAssets(
            this.includes(
                filename,
                getFile(search[1], this.resourceContext)
                    .replace(mainRegEx, `<main>${content}<`),
                assets
            ),
            assets
        )

        return full
    }

    includes(currentPath, html, assets) {
        const regEx = new RegExp(INCLUDES_REGEX)
        let matches

        html = this._getAssets(html, currentPath, assets);

        while ((matches = regEx.exec(html)) !== null) {
            if (matches.index === regEx.lastIndex) {
                regEx.lastIndex++
            }

            const filename = normalizePath(matches[1], currentPath)

            html = html.replace(
                matches[0],
                (match) => {
                    return match.replace('@', '') + '\n' + this.includes(
                        filename,
                        getFile(matches[1], currentPath).trim(),
                        assets
                    )
                }
            )
        }

        return html.trim()
    }

    _getAssets(html = '', currentPath, assets) {
        const regex = new RegExp(ASSETS_REGEX)
        let matches;

        while ((matches = regex.exec(html)) !== null) {
            if (matches.index === regex.lastIndex) {
                regex.lastIndex++
            }

            const filepath = normalizePath(matches[2], currentPath)

            assets[`${matches[1]}s`] = [
                {
                    name: basename(filepath),
                    path: filepath,
                    tag: matches[0].replace(matches[2], filepath)
                },
                ...assets[`${matches[1]}s`]
            ]

            html = html.replace(matches[0], '')
        }

        return html
    }

    _insertAssets(html, assets) {
        html = html.replace('</body>', function (match) {
            return assets.scripts.map(item => item.tag).reverse().join('') + match
        })

        html = html.replace('</head>', function (match) {
            return assets.links.map(item => item.tag).join('') + match
        })

        return html;
    }
}
