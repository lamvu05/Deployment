const FavouriteService = require('../services/favouriteService');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Controller for Favourites operations
 */
const add = catchAsync(async (req, res) => {
  const { service_id } = req.body;
  const favourite = await FavouriteService.addFavourite(req.user.id, service_id);
  res.status(201).json({
    status: 'success',
    message: 'Đã thêm vào danh sách yêu thích',
    data: { favourite }
  });
});

const remove = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const result = await FavouriteService.removeFavourite(req.user.id, serviceId);
  res.json({
    status: 'success',
    message: result.message
  });
});

const getMyFavourites = catchAsync(async (req, res) => {
  const favourites = await FavouriteService.getMyFavourites(req.user.id);
  res.json({
    status: 'success',
    results: favourites.length,
    data: { favourites }
  });
});

const checkIsFavourite = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const result = await FavouriteService.checkIsFavourite(req.user.id, serviceId);
  res.json({
    status: 'success',
    data: result
  });
});

module.exports = {
  add,
  remove,
  getMyFavourites,
  checkIsFavourite
};
