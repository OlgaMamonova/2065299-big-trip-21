function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

const toCapitalize = (str) => `${str[0].toUpperCase()}${str.slice(1)}`;

export {getRandomInRange, getRandomArrayElement, updateItem, toCapitalize};
