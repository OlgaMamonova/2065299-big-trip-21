import { formatToFullDate } from '../util/point';
import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import { EditType, TYPES, POINT_EMPTY } from '../mocks/const';
import flatpickr from 'flatpickr';
import { toCapitalize } from '../util/common';
import he from 'he';

import 'flatpickr/dist/flatpickr.min.css';

function createEventTypesTemplate(type) {
  return (/*html*/`
  ${TYPES.map((eventType) => /*html*/`
    <div class="event__type-item">
      <input id="event-type-${eventType.toLowerCase()}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${eventType.toLowerCase()}" ${type.toLowerCase() === eventType.toLowerCase() ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${eventType.toLowerCase()}" for="event-type-${eventType.toLowerCase()}-1">${eventType}</label>
    </div>`).join('')}
  `);
}

function createDestinationListTemplate (pointDestinations) {
  const cityDestinations = Array.from(new Set(pointDestinations.map((item) => item.name)));
  return (`${cityDestinations.map((city) => `<option value="${city}">${city}</option>`).join('')}`);
}

function createDateTemplate(dateFrom,
  dateTo, isCreating) {
  return (/*html*/`
    <div class="event__field-group  event__field-group--time">
      <label class="visually-hidden" for="event-start-time-1">From</label>
      <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${isCreating ? '' : formatToFullDate(
      dateFrom
    )}" required>
      &mdash;
      <label class="visually-hidden" for="event-end-time-1">To</label>
      <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${isCreating ? '' : formatToFullDate(
      dateTo
    )}" required>
    </div>`);
}

function createPriceTemplate(basePrice) {
  return (/*html*/ `
    <div class="event__field-group  event__field-group--price">
      <label class="event__label" for="event-price-1">
        <span class="visually-hidden">${basePrice}</span>
        &euro;
      </label>
      <input class="event__input  event__input--price" type="number" pattern="^[ 0-9]+$" min="0" id="event-price-1" type="text" name="event-price" value="${he.encode(String(basePrice))}" required>
    </div>
  `);
}

function createOffersTemplate(isOffers, offersByType, offers) {
  return (/*html*/`
  ${isOffers ? /*html*/`
  <section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${offersByType.map((offer) => {
      const checked = offers.includes(offer.id) ? 'checked' : '';
      return /*html*/ `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" data-offer-id=${offer.id}
        ${checked}>
        <label class="event__offer-label" for="event-offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>`;
    })
      .join(' ')}
      </div>
    </section>` : ''}
  `);
}

function createDestinationTemplate(isDestination, currentDestination) {
  return (/*html*/`
  ${isDestination || currentDestination ? /*html*/`
          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${currentDestination.description}</p>
            <div class="event__photos-container">
            <div class="event__photos-tape">
              ${currentDestination.pictures
      .map(
        (picture) => /*html*/ `
                <img class="event__photo" src="${picture.src}" alt="${picture.description}">`
      )
      .join('')}
              </div>
            </div>
          </section>` : ' '}
  `);
}

function createEventEditTemplate({ state, pointDestinations, pointOffers, editMode}) {
  const {
    type,
    basePrice,
    dateFrom,
    dateTo,
    offers
  } = state.point;
  const offersByType = pointOffers.find((item) => item.type.toLowerCase() === type.toLowerCase()).offers;
  const currentDestination = pointDestinations.find((item) => item.id === state.point.destination);

  const isCreating = editMode === EditType.CREATING;
  const rollUpTemplate = () => /*html*/ `
  <button class="event__rollup-btn" type="button">
    <span class="visually-hidden">Open event</span>
  </button>`;

  const isOffers = offersByType.length > 0;
  const isDestination = currentDestination?.pictures.length > 0 || currentDestination?.description;

  return /*html*/ `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createEventTypesTemplate(type)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination ? he.encode(currentDestination.name) : ''}" list="destination-list-1" required>
            <datalist id="destination-list-1">
            ${createDestinationListTemplate(pointDestinations, currentDestination)}
            </datalist>
          </div>

          ${createDateTemplate(dateFrom, dateTo, isCreating)}
          ${createPriceTemplate(basePrice)}
          
          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${isCreating ? 'Cancel' : 'Delete'}</button>
          ${isCreating ? '' : rollUpTemplate()}
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          ${createOffersTemplate(isOffers, offersByType, offers)}
          ${createDestinationTemplate(isDestination, currentDestination)}
        </section>
      </form>
    </li>
  `;

}

export default class EventEditView extends AbstractStatefulView {
  #pointDestinations = null;
  #pointOffers = null;
  #handleFormSubmit = null;
  #handleHideBtnClick = null;
  #handleDeleteClick = null;
  #handleCancelBtnClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  #editMode = EditType.EDITING;

  constructor({ point = POINT_EMPTY, pointDestinations, pointOffers, onFormSubmit, onHideBtnClick, onDeleteClick, onCancelClick, editMode}) {
    super();
    this._setState(EventEditView.parsePointToState({point}));
    this.#pointDestinations = pointDestinations;
    this.#pointOffers = pointOffers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleHideBtnClick = onHideBtnClick;
    this.#handleDeleteClick = onDeleteClick;
    this.#handleCancelBtnClick = onCancelClick;
    this.#editMode = editMode;
    this._restoreHandlers();
  }

  get template() {
    return createEventEditTemplate({
      state: this._state,
      pointDestinations: this.#pointDestinations,
      pointOffers: this.#pointOffers,
      editMode: this.#editMode,
    });
  }

  reset = (point) => this.updateElement({point});

  removeElement = () => {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  };

  _restoreHandlers () {
    if(this.#editMode === EditType.EDITING) {

      this.element.querySelector('.event__rollup-btn')
        .addEventListener('click', this.#hideBtnClickHandler);

      this.element.querySelector('.event__reset-btn')
        .addEventListener('click', this.#deleteBtnClickHandler);
    }
    if(this.#editMode === EditType.CREATING) {
      this.element.querySelector('.event__reset-btn')
        .addEventListener('click', this.#cancelBtnClickHandler);
    }

    this.element.querySelector('.event')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);

    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);

    this.element.querySelector('.event__available-offers')
      ?.addEventListener('change', this.#offerChangeHandler);

    this.element.querySelector('.event__input--price')
      .addEventListener('change', this.#priceChangeHandler);

    this.#setDatepickers();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(EventEditView.parseStateToPoint(this._state));
  };

  #deleteBtnClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(this._state.point);
  };

  #hideBtnClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleHideBtnClick();
  };

  #cancelBtnClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCancelBtnClick();
  };


  #typeChangeHandler = (evt) => {
    this.updateElement({
      point: {
        ...this._state.point,
        type: evt.target.value,
        offers: []
      }
    });
  };

  #destinationChangeHandler = (evt) => {
    const currentDestination = this.#pointDestinations.find((pointDestination) => pointDestination.name === toCapitalize(evt.target.value));
    const currentDestinationId = (currentDestination) ? currentDestination.id : this._state.point.destination;

    this.updateElement({
      point: {
        ...this._state.point,
        destination: currentDestinationId
      }
    });

  };

  #offerChangeHandler = () => {
    const checkedOffers = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'));

    this._setState({
      point: {
        ...this._state.point,
        offers: checkedOffers.map((element) => element.dataset.offerId)
      }
    });
  };

  #priceChangeHandler = (evt) => {
    this._setState({
      point: {
        ...this._state.point,
        basePrice: evt.target.value
      }
    });
  };

  #dateFromCloseHandler = ([userDate]) => {
    this._setState({
      point: {
        ...this._state.point,
        dateFrom: userDate
      }
    });
    this.#datepickerTo.set('minDate', this._state.point.dateFrom);
  };

  #dateToCloseHandler = ([userDate]) => {
    this._setState({
      point: {
        ...this._state.point,
        dateTo: userDate
      }
    });
    this.#datepickerFrom.set('maxDate', this._state.point.dateTo);
  };

  #setDatepickers = () => {
    const [dateFromElement, dateToElement] = this.element.querySelectorAll('.event__input--time');

    const commonConfig = {
      allowInput: true,
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      local: {
        firstDayOfWeek: 1,
      },
      'time_24hr': true
    };

    this.#datepickerFrom = flatpickr(
      dateFromElement,
      {
        ...commonConfig,
        defaultHour: this._state.point.dateFrom,
        onClose: this.#dateFromCloseHandler,
        maxDate: this._state.point.dateTo,
      }
    );

    this.#datepickerTo = flatpickr(
      dateToElement,
      {
        ...commonConfig,
        defaultHour: this._state.point.dateTo,
        onClose: this.#dateToCloseHandler,
        minDate: this._state.point.dateFrom,
      }
    );
  };

  static parsePointToState = ({point}) => ({point});
  static parseStateToPoint = (state) => state.point;
}
