'use strict';

const { Types } = require('mongoose');
const {
  product,
  electronic,
  clothing,
  furniture,
} = require('../product.model');
const {
  getSelectData,
  unGetSelectData,
  convertToObjectIdMongodb,
} = require('../../utils');

const findAllDraftsForShopQuery = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishedByShopQuery = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProductByUserQuery = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isPublished: true,
        $text: {
          $search: regexSearch,
        },
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean();

  return results;
};

const findAllProductsQuery = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return products;
};

const findProductQuery = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(unGetSelectData(unSelect));
};

const updateProductQuery = async ({
  productId,
  payload,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(productId, payload, {
    new: isNew,
  });
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const unPublishProductByShopQuery = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) {
    return null;
  }
  const updatedProduct = await product.findByIdAndUpdate(
    product_id,
    {
      isDraft: true,
      isPublished: false,
    },
    {
      new: true,
    }
  );

  const modifiedCount = updatedProduct ? 1 : 0;

  return modifiedCount;
};

const publishProductByShopQuery = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) {
    return null;
  }
  const updatedProduct = await product.findByIdAndUpdate(
    product_id,
    {
      isDraft: false,
      isPublished: true,
    },
    {
      new: true,
    }
  );

  const modifiedCount = updatedProduct ? 1 : 0;

  return modifiedCount;
};

const getProductByIdQuery = async (productId) => {
  return await product
    .findOne({ _id: convertToObjectIdMongodb(productId) })
    .lean();
};

const checkProductByServerQuery = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductByIdQuery(product.productId);
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          productId: product.productId,
        };
      }
    })
  );
};

module.exports = {
  findAllDraftsForShopQuery,
  publishProductByShopQuery,
  findAllPublishedByShopQuery,
  unPublishProductByShopQuery,
  searchProductByUserQuery,
  findAllProductsQuery,
  findProductQuery,
  updateProductQuery,
  getProductByIdQuery,
  checkProductByServerQuery,
};
