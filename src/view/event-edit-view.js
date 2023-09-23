import { formatToFullDate } from '../util/point';
import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import { TYPES } from '../mocks/const';
import flatpickr from 'flatpickr';
import { toCapitalize } from '../util/common';

import 'flatpickr/dist/flatpickr.min.css';

function createEventTypesTemplate(point) {
  return (/*html*/`
  ${TYPES.map((eventType) => /*html*/`
    <div class="event__type-item">
      <input id="event-type-${eventType.toLowerCase()}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${eventType.toLowerCase()}" ${point.type.toLowerCase() === eventType.toLowerCase() ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${eventType.toLowerCase()}" for="event-type-${eventType.toLowerCase()}-1">${eventType}</label>
    </div>`).join('')}
  `);
}

function createDestinationListTemplate (pointDestinations) {
  const cityDestinations = Array.from(new Set(pointDestinations.map((item) => item.name)));
  return (`${cityDestinations.map((city) => `<option value="${city}">${city}</option>`).join('')}`);
}

function createDateTemplate(point) {
  return (/*html*/`
    <div class="event__field-group  event__field-group--time">
      <label class="visually-hidden" for="event-start-time-1">From</label>
      <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatToFullDate(
      point.dateFrom
    )}">
      &mdash;
      <label class="visually-hidden" for="event-end-time-1">To</label>
      <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatToFullDate(
      point.dateTo
    )}">
    </div>`);
}

function createPriceTemplate(point) {
  return (/*html*/ `
    <div class="event__field-group  event__field-group--price">
      <label class="event__label" for="event-price-1">
        <span class="visually-hidden">${point.basePrice}</span>
        &euro;
      </label>
      <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${point.basePrice}">
    </div>
  `);
}

function createOffersTemplate(isOffers, offersByType, point) {
  return (/*html*/`
  ${isOffers ? /*html*/`
  <section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${offersByType.map((offer) => {
      const checked = point.offers.includes(offer.id) ? 'checked' : '';
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

function createDestinationTemplate(isDestination, destinationsById) {
  const { name, pictures, description } = destinationsById;
  return (/*html*/`
  ${isDestination ? /*html*/`
          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${name} ${description}</p>
            <div class="event__photos-container">
            <div class="event__photos-tape">
              ${pictures
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

function createEventEditTemplate({ state, pointDestinations, pointOffers }) {
  const { point } = state;
  const offersByType = pointOffers.find((item) => item.type.toLowerCase() === point.type.toLowerCase()).offers;
  const destinationsById = pointDestinations.find((item) => item.id === point.destination);

  const { name, pictures, description } = destinationsById;


  const isOffers = offersByType.length > 0;
  const isDestination = pictures.length > 0 || description;

  return /*html*/ `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type.toLowerCase()}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createEventTypesTemplate(point)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${point.type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${name}" list="destination-list-1">
            <datalist id="destination-list-1">
            ${createDestinationListTemplate(pointDestinations, destinationsById)}
            </datalist>
          </div>

          ${createDateTemplate(point)}
          ${createPriceTemplate(point)}
          
          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          ${createOffersTemplate(isOffers, offersByType, point)}
          ${createDestinationTemplate(isDestination, destinationsById)}
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
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({ point, pointDestinations, pointOffers, onFormSubmit, onHideBtnClick }) {
    super();
    this._state = point;
    this.#pointDestinations = pointDestinations;
    this.#pointOffers = pointOffers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleHideBtnClick = onHideBtnClick;

    this._setState(EventEditView.parsePointToState({point}));
    this._restoreHandlers();
  }

  get template() {
    return createEventEditTemplate({
      state: this._state,
      pointDestinations: this.#pointDestinations,
      pointOffers: this.#pointOffers,
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

  _restoreHandlers = () => {
    this.element.querySelector('.event')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#hideBtnClickHandler);

    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#destionationChangeHandler);

    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);

    this.element.querySelector('.event__available-offers')
      ?.addEventListener('change', this.#offerChangeHandler);

    this.element.querySelector('.event__input--price')
      .addEventListener('change', this.#priceChangeHandler);

    this.#setDatepickers();
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(this._state);
  };

  #hideBtnClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleHideBtnClick();
  };

  #typeChangeHandler = (evt) => {
    this.updateElement({
      point: {
        ...this._state.point,
        type: evt.target.value,
        offer: []
      }
    });
  };

  #destionationChangeHandler = (evt) => {
    const selectedDestination = this.#pointDestinations.find((pointDestination) => pointDestination.name === toCapitalize(evt.target.value));
    const selectedDestinationId = (selectedDestination) ? selectedDestination.id : this._state.point.destination;

    this.updateElement({
      point: {
        ...this._state.point,
        destination: selectedDestinationId
      }
    });

  };

  #offerChangeHandler = () => {
    const checkedOffers = Array.from(this.element.querySelectorAll('.event__offer-chackbox:checked'));

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
