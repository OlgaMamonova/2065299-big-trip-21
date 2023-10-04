import AbstractView from '../framework/view/abstract-view.js';

function createNewPointButtonTemplate () {
  return /*html*/ `
  <button  class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">New event</button>
    `;
}

export default class NewPointButtonView extends AbstractView {
  #handleButtonClick = null;

  constructor({onButtonClick}) {
    super();
    this.#handleButtonClick = onButtonClick;

    this.element.addEventListener('click', this.#buttonClickHandler);
  }

  get template() {
    return createNewPointButtonTemplate();
  }

  setDisabled(isDisabled) {
    this.element.disabled = isDisabled;
  }

  #buttonClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleButtonClick();
  };
}
