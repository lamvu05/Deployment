const ServiceModel = require('../models/serviceModel');
const AppError = require('../utils/AppError');

const ServiceService = {
  getAll: (activeOnly) => ServiceModel.findAll(activeOnly),

  getById: async (id) => {
    const svc = await ServiceModel.findById(id);
    if (!svc) throw new AppError('Service not found', 404);
    return svc;
  },

  create: async (data) => ServiceModel.create(data),

  update: async (id, fields) => {
    await ServiceService.getById(id);
    const updated = await ServiceModel.update(id, fields);
    if (!updated) throw new AppError('Nothing to update', 400);
    return updated;
  },

  remove: async (id) => {
    await ServiceService.getById(id);
    await ServiceModel.delete(id);
    return { message: 'Service deleted' };
  },
};

module.exports = ServiceService;
