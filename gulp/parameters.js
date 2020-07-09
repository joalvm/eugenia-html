import { isDevelop, env, targetPath } from "./helpers"
import { resolve } from "path"

export const sass = {
    outputStyle: isDevelop() ? 'expanded' : 'compresed'
}

export const rename = {
    suffix: isDevelop() ? '' : '.min'
}

export const autoprefixer = {
    browsersList: ['last 2 versions'],
    supports: 'ie8',
    cascade: false,
    grid: true
}

export const sourcemap = {
    init: {
        loadMaps: true,
        largeFile: true
    },
    write: '.'
}

export const webpack = {
    mode: env('APP_ENV'),
    devtool: 'source-map',
    watch: false,
    cache: false,
    target: 'web',
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    devServer: {
        lazy: true
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                include: resolve(__dirname, '..', 'src'),
                use: {
                    loader: require.resolve('ts-loader'),
                    options: {
                        transpileOnly: true
                    }
                },
            }
        ]
    }
}

export const browserSync = {
    open: env('SERVER_OPEN', false) === 'true',
    port: env('SERVER_PORT', 8080),
    server: {
        baseDir: targetPath()
    }
    // proxy: {
    //     target: env('SERVER_PROXY', 'http://localhost/')
    // }
}