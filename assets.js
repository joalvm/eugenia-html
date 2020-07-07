export default {
    jquery: {
        minified: true,
        scripts: ["jquery/dist/jquery.js"]
    },
    bootstrap: {
        minified: true,
        scripts: ["bootstrap/dist/js/bootstrap.js"],
        styles: ["bootstrap/dist/css/bootstrap.css"],
        deps: ["@jquery", "@popper"]
    },
    popper: {
        minified: true,
        scripts: ["popper.js/dist/popper.js"]
    },
    isotope: {
        minified: true,
        scripts: ["isotope-layout/dist/isotope.pkgd.js"]
    }
}