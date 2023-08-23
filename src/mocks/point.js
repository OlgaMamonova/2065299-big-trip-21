import { getRandomInRange, generateDate, getCurrentDate } from '../utils';
import { Price } from './const';

function generatePoint(type, destinationId, offerIds) {

  return {
    id: crypto.randomUUID(),
    basePrice: getRandomInRange(Price.MIN, Price.MAX),
    dateFrom: getCurrentDate(),
    dateTo: generateDate(),
    destination: destinationId,
    isFavorite: getRandomInRange(0, 1),
    type,
    offers: offerIds,
  };
}

export { generatePoint };
