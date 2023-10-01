export default class DestinationsModel {
  #service = null;
  #destinations = null;

  constructor(service) {
    this.#service = service;
  }

  async init() {
    this.#destinations = await this.#service.destinations;
    return this.#destinations;
  }

  get() {
    return this.#destinations;
  }

  getById(id) {
    return this.#destinations
      .find((destination) => destination.id === id);
  }
}
