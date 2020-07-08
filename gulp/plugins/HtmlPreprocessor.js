import { basename, resolve, relative } from 'path'
import { getFile, normalizePath, normalizeScriptPath, normalizeStylePath } from '../helpers'
import { TEMPLATE_REGEX, INCLUDES_REGEX } from './HtmlStructure'

export default class HtmlPreprocessor {
    constructor(context) {
        this.resourceContext = context
        this.templatePath = '';
    }

    build(content) {
        const search = (new RegExp(TEMPLATE_REGEX)).exec(content.trim())
        const assets = {
            links: [],
            scripts: []
        }

        if (search === null) {
            return content
        }

        const filename = normalizePath(search[1], this.resourceContext)
        const template = this._getAssets(
            getFile(search[1], this.resourceContext),
            filename,
            assets
        )

        // Busca los archivos a incluir para el archivo actual
        content = this.includes(
            this.resourceContext,
            this._getAssets(
                content.replace(search[0], '').trim(),
                this.resourceContext,
                assets
            ),
            assets
        )

        // agrega todo a la etiqueta <main> y busca si el template
        // tambien tiene archivos a incluir
        return this._insertAssets(
            this.includes(
                filename,
                template.replace('</main>', (match) => `${content}${match}`),
                assets
            ),
            assets
        )
    }

    includes(currentPath, html, assets) {
        const regEx = new RegExp(INCLUDES_REGEX)
        let matches

        html = this._getAssets(html, currentPath, assets);

        while ((matches = regEx.exec(html)) !== null) {
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

            if (matches.index === regEx.lastIndex) {
                regEx.lastIndex++
            }
        }

        return html.trim()
    }

    _getAssets(html = '', currentPath, assets) {
        return this._getAssetsScript(
            this._getAssetsLinks(html, currentPath, assets),
            currentPath,
            assets
        )
    }

    _getAssetsScript(html = '', currentPath, assets) {
        const tags = html.match(/(?:<)script.+(?:><\/script>)/gm)

        if (!tags) {
            return html
        }

        for (const tag of tags) {
            const src = /src="(.+)"/gm.exec(tag)

            if (!src) {
                continue
            }

            const filepath = normalizePath(src[1], currentPath)

            assets.scripts.push({
                name: basename(filepath),
                path: filepath,
                tag: tag.replace(src[1], filepath)
            })

            html = html.replace(tag, '')
        }

        return html;
    }

    _getAssetsLinks(html = '', currentPath, assets) {
        const tags = html.match(/(?:<)link.+(?:(\/)?>)/gm)

        if (!tags) {
            return html
        }

        for (const tag of tags) {
            const href = /href="(.+)"/gm.exec(tag)

            if (!href) {
                continue
            }

            const filepath = normalizePath(href[1], currentPath)

            assets.links.push({
                name: basename(filepath),
                path: filepath,
                tag: tag.replace(href[1], filepath)
            })

            html = html.replace(tag, '')
        }

        return html;
    }

    _insertAssets(html, assets) {
        html = html.replace('</body>', function (match) {
            return assets.scripts.map(item => {
                return item.tag.replace(item.path, normalizeScriptPath(item.path))
            }).join('') + match
        })

        html = html.replace('</head>', function (match) {
            return assets.links.map(item => {
                return item.tag.replace(item.path, normalizeStylePath(item.path))
            }).join('') + match
        })

        return html;
    }
}