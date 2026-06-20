const ServiceService = require('../services/serviceService');
const { catchAsync } = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const activeOnly = req.user?.role !== 'admin';
  const services = await ServiceService.getAll(activeOnly);
  res.json({ status: 'success', results: services.length, data: { services } });
});

const getById = catchAsync(async (req, res) => {
  const service = await ServiceService.getById(req.params.id);
  res.json({ status: 'success', data: { service } });
});

const create = catchAsync(async (req, res) => {
  const service = await ServiceService.create(req.body);
  res.status(201).json({ status: 'success', data: { service } });
});

const update = catchAsync(async (req, res) => {
  const service = await ServiceService.update(req.params.id, req.body);
  res.json({ status: 'success', data: { service } });
});

const remove = catchAsync(async (req, res) => {
  const result = await ServiceService.remove(req.params.id);
  res.json({ status: 'success', data: result });
});

module.exports = { getAll, getById, create, update, remove };
