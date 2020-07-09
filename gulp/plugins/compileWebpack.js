import { relative, basename, join } from 'path'
import { scriptsPath, targetPath, isDevelop, sourcePath } from '../helpers'
import MemoryFileSystem from 'memory-fs'
import through2 from 'through2';
import webpack from 'webpack'
import File from 'vinyl'

export default function compileWebpack(parametters) {
    return through2.obj(function (file, enc, cb) {
        (async (_file) => {
            const sourceMap = _file.sourceMap || ''

            const output = relative(
                targetPath(),
                scriptsPath(basename(_file.path).replace('.ts', '.js'))
            );

            let compiler = webpack({
                ...parametters,
                entry: _file.path,
                output: {
                    filename: output
                }
            })

            var fs = compiler.outputFileSystem = new MemoryFileSystem()
            await compiler.run((err, stats) => {
                var path = fs.join(compiler.outputPath, output)
                var contents = fs.readFileSync(path)

                const newFile = new File({
                    base: compiler.outputPath,
                    path: join(compiler.outputPath, basename(output)),
                    contents
                })

                if (sourceMap) {
                    sourceMap.sources = [basename(output), ...sourceMap.sources]
                    newFile.sourceMap = sourceMap
                }

                setImmediate(cb, null, newFile)

                return file
            })
            
        })(file)
    })
}