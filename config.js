export default {
  source: './src/',
  target: './dist/',
  input: {
    pages: 'pages',
    templates: 'templates',
    public: 'public',
    assets: 'assets'
  },
  output: {
    index_page: 'home',
    public_dir: '',
    assets: {
      name: 'static',
      hash: true,
      hash_length: 8,
      keep_folder: false,
      directories: {
        scripts: 'js',
        styles: 'css',
        images: 'img',
        fonts: 'fonts'
      }
    },
  },
  copy: [
    'assets/js',
    'assets/css'
  ],
  server: {
    open: false,
    port: 9000,
  }
}
