import { templatePath as templateSearch, resolvePath, getFile, realname, publicPath, isUrl, sourcePath } from "../helpers";
import { sync as globSync } from 'glob'
import { basename } from "path";

export const TEMPLATE_REGEX = /(?:<!--(?:\s+)?)?@template\((.+)\)(?:(?:\s+)?-->)?/gm
export const INCLUDES_REGEX = /(?:<!--(?:\s+)?)?@include\((.+)\)(?:(?:\s+)?-->)?/gm
export const ASSETS_REGEX = /(?:<(img|script|link)).+?(?:(?:src|href)(?:\s+)?=(?:\s+)?"(.+?)").*?(?:\/)?(?:>)(?:<\/script>)?/gm

export default class Structure {
    constructor(source = '') {
        this.schema = {}
        this.root = sourcePath(source)

        this._init()
    }

    getSchema(name) {
        return this.schema[name] || {}
    }

    getRoot() {
        return this.root
    }

    _init() {
        globSync(`${this.root}/**/*.html`).forEach((path) => {
            const name = realname(path)
            const filepath = resolvePath(path, sourcePath())
            const html = getFile(filepath)
            const templateMatch = new RegExp(TEMPLATE_REGEX).exec(html)

            /**
             * Solos los archivos que hacen llamado al template son indexados.
             */
            if (templateMatch === null) {
                return
            }

            const templatePath = templateSearch(templateMatch[1])
            const templateHtml = getFile(templatePath)

            this.schema[name] = {
                path: filepath,
                template: templatePath,
                target: publicPath(),
                includes: [],
                assets: {
                    scripts: [],
                    links: [],
                    imgs: [],
                    videos: []
                }
            }

            // Buscamos los assets del template princial
            this._scanAssets(name, templateHtml, templatePath)

            this.schema[name].includes = this._getIncludes(name, html, filepath)
        })
    }

    _getIncludes(name, html = '', htmlPath) {
        const regEx = new RegExp(INCLUDES_REGEX)
        let paths = []
        let matches = null

        this._scanAssets(name, html, htmlPath);

        while ((matches = regEx.exec(html)) !== null) {
            if (matches.index === regEx.lastIndex) {
                regEx.lastIndex++
            }

            const newHtmlPath = resolvePath(matches[1], htmlPath)
            const newHtml = getFile(newHtmlPath)

            paths = [
                ...paths,
                newHtmlPath,
                ...this._getIncludes(name, newHtml, newHtmlPath)
            ]
        }

        return paths
    }

    _scanAssets(name, html, htmlPath) {
        const regex = new RegExp(ASSETS_REGEX)
        let matches;

        while ((matches = regex.exec(html)) !== null) {
            if (matches.index === regex.lastIndex) {
                regex.lastIndex++
            }

            // Solo se normalizan las rutas que son relativas
            const checkUrl = isUrl(matches[2])
            const filepath = !checkUrl
                                ? resolvePath(matches[2], htmlPath) 
                                : matches[2]
            
            this.schema[name].assets[`${matches[1]}s`].push({
                name: basename(filepath),
                isUrl: checkUrl,
                path: filepath,
                tag: matches[0].replace(matches[2], filepath)
            })
        }
    }
}
