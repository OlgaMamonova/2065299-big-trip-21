import EventsListView from '../view/events-list-view';
import SortView from '../view/sort-view';
import NoPointView from '../view/no-point-view';
import PointPresenter from './point-presenter';
import { render, RenderPosition, replace, remove } from '../framework/render';
import { SortTypes, UpdateType, UserAction, enabledSortType, FilterTypes } from '../mocks/const';
import { sortBy } from '../util/sort-by';
import { filterBy } from '../util/filter-by';
import NewPointPresenter from './new-point-presenter';
import LoadingView from '../view/loading-view';

export default class BoardPresenter {
  #eventListComponent = new EventsListView();
  #sortComponent = null;
  #loadingComponent = new LoadingView();
  #noPointComponent = null;
  #boardContainer = null;

  #destinationsModel = null;
  #offersModel = null;
  #pointsModel = null;
  #filterModel = null;
  #newPointButtonPresenter = null;
  #newPointPresenter = null;
  #currentSortType = SortTypes.DAY;
  #pointPresenters = new Map();
  #isCreating = false;
  #isLoading = true;

  constructor({boardContainer, destinationsModel, offersModel, pointsModel, filterModel, newPointButtonPresenter}) {
    this.#boardContainer = boardContainer;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#newPointButtonPresenter = newPointButtonPresenter;

    this.#newPointPresenter = new NewPointPresenter({
      container: this.#eventListComponent.element,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onPointChange: this.#handleViewAction,
      onDestroy: this.#newPointDestroyHandler,
    });

    this.#pointsModel.addObserver(this.#modelEventHandler);
    this.#filterModel.addObserver(this.#modelEventHandler);
  }

  get points() {
    const filterType = this.#filterModel.get();
    const filteredPoints = filterBy[filterType](this.#pointsModel.get());

    return sortBy[this.#currentSortType](filteredPoints);
  }

  newPointButtonClickHandler = () => {
    this.#isCreating = true;
    this.#currentSortType = SortTypes.DAY;
    this.#filterModel.set(UpdateType.MAJOR, FilterTypes.EVERYTHING);
    this.#newPointButtonPresenter.disableButton();
    this.#newPointPresenter.init();
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    this.#newPointPresenter.destroy();
  };


  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      container: this.#eventListComponent.element,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderSort() {
    const prevSortComponent = this.#sortComponent;

    const sortTypes = Object.values(SortTypes)
      .map((type) => ({
        type,
        isChecked: (type === this.#currentSortType),
        isDisabled: !enabledSortType[type]
      }));

    this.#sortComponent = new SortView({
      items: sortTypes,
      onItemChange: this.#sortTypeChangeHandler
    });
    if (prevSortComponent) {
      replace(this.#sortComponent, prevSortComponent);
      remove(prevSortComponent);
    } else {
      render(this.#sortComponent, this.#boardContainer, RenderPosition.AFTERBEGIN);
    }
  }

  #clearBoard = ({resetSortType = false} = {}) => {
    this.#clearPoints();
    remove(this.#loadingComponent);
    remove(this.#sortComponent);
    this.#sortComponent = null;

    if(resetSortType) {
      this.#currentSortType = SortTypes.DAY;
    }
  };

  #newPointDestroyHandler = ({isCanceled}) => {
    this.#isCreating = false;
    this.#newPointButtonPresenter.enableButton();
    if (this.points.length === 0 && isCanceled) {
      this.#clearBoard();
      this.#renderBoard();
    }
  };

  #handleViewAction = async (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointsModel.update(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.CREATE_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointsModel.add(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointsModel.delete(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }
  };

  #modelEventHandler = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters?.get(data.id)?.init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderBoard();
        break;
    }
  };

  #sortTypeChangeHandler = (sortType) => {
    this.#currentSortType = sortType;
    this.#clearPoints();
    this.#renderSort();
    this.#renderPoints();

  };

  #renderPointsContainer() {
    render(this.#eventListComponent, this.#boardContainer);
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#boardContainer);
  }

  #renderPoints() {
    this.points.forEach((point) => {
      this.#renderPoint(point);
    });
  }

  #clearPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
    remove(this.#noPointComponent);
    this.#newPointPresenter.destroy();
  }

  #renderNoPoint() {
    this.#noPointComponent = new NoPointView({
      filterType: this.#filterModel.get()
    });
    render(this.#noPointComponent, this.#boardContainer);
  }

  #renderBoard() {
    if (this.#isLoading) {
      this.#newPointButtonPresenter.disableButton();
      this.#renderLoading();
      return;
    }

    if (this.points.length === 0 && !this.#isCreating) {
      this.#newPointButtonPresenter.enableButton();
      this.#renderNoPoint();
      return;
    }

    this.#newPointButtonPresenter.enableButton();

    this.#renderSort();
    this.#renderPointsContainer();
    this.#renderPoints();
  }

  init() {
    this.#renderBoard();
  }
}
