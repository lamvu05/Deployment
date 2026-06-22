const FavouriteModel = require('../models/favouriteModel');
const ServiceModel = require('../models/serviceModel');
const AppError = require('../utils/AppError');

const FavouriteService = {
  /**
   * Add a service to user's favorites
   * @param {string} userId
   * @param {string} serviceId
   */
  addFavourite: async (userId, serviceId) => {
    // 1. Check if service exists
    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      throw new AppError('Dịch vụ không tồn tại', 404);
    }

    // 2. Add to favorites
    const favourite = await FavouriteModel.add(userId, serviceId);
    if (!favourite) {
      throw new AppError('Dịch vụ này đã có trong danh sách yêu thích', 400);
    }
    return favourite;
  },

  /**
   * Remove a service from user's favorites
   * @param {string} userId
   * @param {string} serviceId
   */
  removeFavourite: async (userId, serviceId) => {
    const removed = await FavouriteModel.remove(userId, serviceId);
    if (!removed) {
      throw new AppError('Dịch vụ không có trong danh sách yêu thích', 404);
    }
    return { message: 'Đã xóa khỏi danh sách yêu thích thành công' };
  },

  /**
   * Get user's favorites list
   * @param {string} userId
   */
  getMyFavourites: async (userId) => {
    return FavouriteModel.findByUser(userId);
  },

  /**
   * Check if a service is favorited by the user
   * @param {string} userId
   * @param {string} serviceId
   */
  checkIsFavourite: async (userId, serviceId) => {
    const isFav = await FavouriteModel.isFavorited(userId, serviceId);
    return { is_favourite: isFav };
  }
};

module.exports = FavouriteService;
