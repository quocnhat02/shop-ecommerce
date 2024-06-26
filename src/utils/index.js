'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const { Types } = require('mongoose');

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const createStringHex = () => {
  return crypto.randomBytes(64).toString('hex');
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] == null) {
      delete obj[k];
    }
  });

  return obj;
};

const updateNestedObjectParser = (obj) => {
  const final = {};

  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParser(obj[k]);
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a];
      });
    } else {
      final[k] = obj[k];
    }
  });

  return final;
};

const convertToObjectIdMongodb = (id) => new Types.ObjectId(id);

const randomImageName = () => crypto.randomBytes(16).toString('hex');

module.exports = {
  getInfoData,
  createStringHex,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectIdMongodb,
  randomImageName,
};
