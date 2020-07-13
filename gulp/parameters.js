import { 
    env,
    isDevelop,
    targetPath,
    reportError,
    sourcePath,
    environment,
    basePath
} from "./helpers"

export const src = {
    root: basePath()
}

export const htmlmin = {
    collapseWhitespace: true
}

export const sass = {
    outputStyle: isDevelop() ? 'expanded' : 'compressed'
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
    mode: environment(),
    watch: false,
    cache: false,
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                include: sourcePath(),
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
    open: env('server.open', false),
    port: env('server.port', 8080),
    server: {
        baseDir: targetPath()
    }
}

export const plumber = {
    errorHandler: reportError
}