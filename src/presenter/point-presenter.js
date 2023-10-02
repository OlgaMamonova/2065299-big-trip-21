import EventEditView from '../view/event-edit-view';
import PointView from '../view/point-view';
import { render, replace, remove } from '../framework/render';
import { UpdateType, UserAction, MODE, EditType } from '../mocks/const';
import { isBigDifference } from '../util/point';

export default class PointPresenter {
  #container = null;
  #destinationsModel = null;
  #offersModel = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #pointComponent = null;
  #editPointComponent = null;
  #point = null;
  #mode = MODE.DEFAULT;

  constructor({container, destinationsModel, offersModel, onDataChange, onModeChange }) {
    this.#container = container;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#editPointComponent;

    this.#pointComponent = new PointView({
      point: this.#point,
      pointDestinations: this.#destinationsModel.getById(point.destination),
      pointOffers: this.#offersModel.getByType(point.type),
      onEditBtnClick: this.#handleEditBtnClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#editPointComponent = new EventEditView({
      point: this.#point,
      pointDestinations: this.#destinationsModel.get(),
      pointOffers: this.#offersModel.get(),
      onFormSubmit: this.#handleFormSubmit,
      onHideBtnClick: this.#handleHideBtnClick,
      onDeleteClick: this.#handleDeleteClick,
      editMode: EditType.EDITING
    });

    if (prevPointComponent === null || prevPointEditComponent === null) {
      render(this.#pointComponent, this.#container);
      return;
    }

    if (this.#mode === MODE.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === MODE.EDITING) {
      replace(this.#editPointComponent, prevPointEditComponent);
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#editPointComponent);
  }

  resetView() {
    if (this.#mode !== MODE.DEFAULT) {
      this.#editPointComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  }

  setSaving = () => {
    if(this.#mode === MODE.EDITING) {
      this.#editPointComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  };

  setDeleting = () => {
    if(this.#mode === MODE.EDITING) {
      this.#editPointComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  };

  setAborting = () => {
    if(this.#mode === MODE.DEFAULT) {
      this.#pointComponent.shake();
      return;
    }
    if(this.#mode === MODE.EDITING) {
      const resetFormState = () => {
        this.#editPointComponent.updateElement({
          isDisabled: false,
          isSaving: false,
          isDeleting: false,
        });
      };

      this.#editPointComponent.shake(resetFormState);
    }
  };

  #replacePointToForm() {
    replace(this.#editPointComponent, this.#pointComponent);
    this.#handleModeChange();
    this.#mode = MODE.EDITING;
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#editPointComponent);
    this.#mode = MODE.DEFAULT;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#editPointComponent.reset(this.#point);
      this.#replaceFormToPoint();

    }
  };

  #handleEditBtnClick = () => {
    this.#replacePointToForm();
    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleFormSubmit = (updatedPoint) => {
    const isMinor = isBigDifference(updatedPoint, this.#point);

    this.#handleDataChange(
      UserAction.UPDATE_POINT, isMinor ? UpdateType.MINOR : UpdateType.PATCH,
      updatedPoint
    );
    this.#replaceFormToPoint();
  };

  #handleHideBtnClick = () => {
    this.#editPointComponent.reset(this.#point);
    this.#replaceFormToPoint();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      {
        ...this.#point,
        isFavorite: !this.#point.isFavorite
      }
    );
  };

  #handleDeleteClick = (point) => {
    this.#handleDataChange(UserAction.DELETE_POINT, UpdateType.MINOR, point);
  };
}
