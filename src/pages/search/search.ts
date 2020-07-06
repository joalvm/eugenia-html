class Search {
  private button: JQuery<HTMLButtonElement>

  constructor() {
    this.button = $('#btn')

    this.setEvents()
  }

  private setEvents() {
    this.button.on('click', this.goToHome.bind(this))
  }

  goToHome(event: JQuery.ClickEvent) {
    console.log(event, []);
  }
}

jQuery(function () {
  new Search()
})
