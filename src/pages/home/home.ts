import header from './../../layouts/header/header'

class Home {
  private className: string

  constructor() {
    this.className = 'Home editado'
  }

  say(): void {
    new header()
    console.log(`Say from ${this.className}`)
  }
}

jQuery(function () {
  (new Home()).say()
})
