import { RenderPosition, render } from './framework/render';
import TripInfoView from './view/trip-info-view';
import BoardPresenter from './presenter/board-presenter';
import DestinationsModel from './model/destinations-model';
import OffersModel from './model/offers-model';
import PointsModel from './model/points-model';
import FilterPresenter from './presenter/filter-presenter';
import FilterModel from './model/filter-model';
import NewPointButtonPresenter from './presenter/new-point-button-presenter';
import PointsApiService from './service/point-api-service';

const AUTHORIZATION = 'Basic b423sfs3e76';
const END_POINT = 'https://21.objects.pages.academy/big-trip';

const tripInfoElement = document.querySelector('.trip-main');
const filterElement = document.querySelector('.trip-controls__filters');
const tripEventsElement = document.querySelector('.trip-events');

const pointsApiService = new PointsApiService(END_POINT, AUTHORIZATION);

const destinationsModel = new DestinationsModel(pointsApiService);
const offersModel = new OffersModel(pointsApiService);
const pointsModel = new PointsModel({
  service: pointsApiService,
  destinationsModel,
  offersModel
});

const filterModel = new FilterModel;

const newPointButtonPresenter = new NewPointButtonPresenter({container: tripInfoElement});

const boardPresenter = new BoardPresenter({
  boardContainer: tripEventsElement,
  destinationsModel,
  offersModel,
  pointsModel,
  filterModel,
  newPointButtonPresenter
});

const filterPresenter = new FilterPresenter({
  container: filterElement,
  pointsModel,
  filterModel
});

render(new TripInfoView(), tripInfoElement, RenderPosition.AFTERBEGIN);

newPointButtonPresenter.init({onButtonClick: boardPresenter.newPointButtonClickHandler});
filterPresenter.init();
boardPresenter.init();
pointsModel.init();

