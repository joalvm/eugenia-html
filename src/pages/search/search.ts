import Index from './../../templates/index'
class Search {
  private button: JQuery<HTMLButtonElement>
  private className: string = 'Search Class actualizado'

  constructor() {
    this.button = $('#btn')

    this.setEvents()
  }

  private setEvents() {
    this.button.on('click', this.goToHome.bind(this))
  }

  goToHome(event: JQuery.ClickEvent) {
    alert("hola mundo!")
  }
}

jQuery(function () {
  (new Search());
  (new Index());
})