import { basename } from 'path'
import { sourcePath, getFile, normalizePath } from '../helpers'
import { sync } from 'glob'

export const TEMPLATE_REGEX = /(?:<!--(?:\s+)?)?@template\((.+)\)(?:(?:\s+)?-->)?/gm
export const INCLUDES_REGEX = /(?:<!--(?:\s+)?)?@include\((.+)\)(?:(?:\s+)?-->)?/gm
export const ASSETS_REGEX = /(?:<(script|link)).+?(?:(?:src|href)(?:\s+)?=(?:\s+)?"(.+)").*?(?:\/)?(?:>)(?:<\/script>)?/gm

export default class HtmlStructure {
    constructor(pattern) {
        this.files = sync(sourcePath(pattern)).map((path) => {
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
