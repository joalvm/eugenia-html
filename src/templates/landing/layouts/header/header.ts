class Header {
  say() {
    console.log('hello from header')
  }
}

jQuery(function () {
  (new Header()).say()
})

export default Header
