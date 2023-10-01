const POINT_COUNT = 8;
const OFFER_COUNT = 6;
const DESTINATION_COUNT = 9;
const PICTURE_COUNT = 8;

const CITIES = [
  'Chamonix',
  'Amsterdam',
  'Geneva',
  'Moscow',
  'Berlin',
  'London',
  'Tokio',
  'Madrid',
  'Barcelona',
];

const DESCRIPTION = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Cras aliquet varius magna, non porta ligula feugiat eget.',
  'Fusce tristique felis at fermentum pharetra.',
  'Aliquam id orci ut lectus varius viverra.',
  'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.',
];

const OFFERS = [
  'Add luggage',
  'Switch to comfort',
  'Add meal',
  'Choose seats',
  'Travel by train',
];

const PRICE = {
  MIN: 1,
  MAX: 1000,
};

const TYPES = [
  'Taxi',
  'Bus',
  'Train',
  'Ship',
  'Drive',
  'Flight',
  'Check-in',
  'Sightseeing',
  'Restaurant',
];
const DEFAULT_TYPE = 'flight';

const DATE_FORMAT = 'MMM DD';
const TIME_FORMAT = 'HH:mm';
const FULL_DATE_FORMAT = 'DD/MM/YY HH:mm';

const FilterTypes = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

const SortTypes = {
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFERS: 'offers'
};

const enabledSortType = {
  [SortTypes.DAY]: true,
  [SortTypes.EVENT]: false,
  [SortTypes.TIME]: true,
  [SortTypes.PRICE]: true,
  [SortTypes.OFFERS]: false,
};

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  DELETE_POINT: 'DELETE_POINT',
  CREATE_POINT: 'CREATE_POINT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
};

const NoPointText = {
  EVERYTHING : 'Click New Event to create your first point',
  FUTURE : 'There are no future events now',
  PRESENT : 'There are no present events now',
  PAST : 'There are no past events now',
};

const EditType = {
  EDITING: 'EDITING',
  CREATING: 'CREATING',
};

const POINT_EMPTY = {
  basePrice: 0,
  dateFrom: null,
  dateTo: null,
  destination: null,
  isFavorite: false,
  offers: [],
  type: DEFAULT_TYPE,
};


const MODE = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

const adaptToClient = (point) => {
  const adaptedPoint = {
    ...point,
    dateFrom: point['date_from'],
    dateTo: point['date_to'],
    basePrice: point['base_price'],
    isFavorite: point['is_favorite'],
  };

  delete adaptedPoint['date_from'];
  delete adaptedPoint['date_to'];
  delete adaptedPoint['base_price'];
  delete adaptedPoint['is_favorite'];

  return adaptedPoint;
};

const adaptToServer = (point) => {
  const adaptedPoint = {
    ...point,
    ['date_from']: new Date(point.dateFrom).toISOString(),
    ['date_to']: new Date(point.dateTo).toISOString(),
    ['base_price']: point.basePrice,
    ['is_favorite']: point.isFavorite,
  };

  delete adaptedPoint.dateFrom;
  delete adaptedPoint.dateTo;
  delete adaptedPoint.basePrice;
  delete adaptedPoint.isFavorite;

  return adaptedPoint;
};

export {
  POINT_COUNT,
  CITIES,
  DESCRIPTION,
  PRICE,
  TYPES,
  OFFER_COUNT,
  DATE_FORMAT,
  TIME_FORMAT,
  FULL_DATE_FORMAT,
  PICTURE_COUNT,
  OFFERS,
  DESTINATION_COUNT,
  FilterTypes,
  SortTypes,
  enabledSortType,
  UpdateType,
  UserAction,
  NoPointText,
  EditType,
  POINT_EMPTY,
  MODE,
  Method,
  adaptToClient,
  adaptToServer
};
