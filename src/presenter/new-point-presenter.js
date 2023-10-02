import {render, remove, RenderPosition } from '../framework/render.js';
import EventEditView from '../view/event-edit-view.js';
import { UserAction, UpdateType, EditType } from '../mocks/const.js';

export default class NewPointPresenter {
  #container = null;
  #destinationsModel = null;
  #offersModel = null;
  #pointNewComponent = null;

  #handleDataChange = null;
  #handleDestroy = null;

  constructor({container, destinationsModel, offersModel, onPointChange, onDestroy}) {
    this.#container = container;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handleDataChange = onPointChange;
    this.#handleDestroy = onDestroy;
  }

  init() {
    if (this.#pointNewComponent) {
      return;
    }

    this.#pointNewComponent = new EventEditView({
      pointDestinations: this.#destinationsModel.get(),
      pointOffers: this.#offersModel.get(),
      onCancelClick: this.#resetClickHandler,
      onFormSubmit: this.#formSubmitHandler,
      editMode: EditType.CREATING
    });

    render(this.#pointNewComponent, this.#container, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy({isCanceled = true} = {}) {
    if (!this.#pointNewComponent) {
      return;
    }
    remove(this.#pointNewComponent);
    this.#pointNewComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);

    this.#handleDestroy({isCanceled});
  }

  setSaving = () => {
    this.#pointNewComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  };

  setAborting = () => {
    const resetFormState = () => {
      this.#pointNewComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#pointNewComponent.shake(resetFormState);
  };

  #resetClickHandler = () => {
    this.destroy();
  };

  #formSubmitHandler = (point) => {
    this.#handleDataChange (
      UserAction.CREATE_POINT,
      UpdateType.MINOR,
      point
    );
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
