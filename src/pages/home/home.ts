class Home {
  private className: string

  constructor() {
    this.className = 'Hola mundo 2!'
  }

  say(): void {
    console.log(`Say from ${this.className}`)
  }
}

jQuery(function () {
  (new Home()).say()
})
