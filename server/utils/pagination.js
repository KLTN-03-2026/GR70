// utils/pagination.js
const { Op } = require("sequelize");

async function getPagination({
  model,         // Sequelize model (vd: User, Product)
  attributes=[],
  page = 1,
  size = 10,
  filters = {},  // { search, isActive, fromDate, toDate }
  orderClaude=null,
  orderBy = "",
  order = "ASC",
  searchFields = ["name"], // cột được tìm kiếm khi có search
  where = {} , // custom where thêm ngoài filters
  include = [],
  group
}) {
  const limit = size;
  const offset = (page - 1) * size;
  // --- Build dynamic conditions ---
  // console.log(filters);
  if (filters.search) {
    where[Op.or] = searchFields.map(field => ({
      [field]: { [Op.iLike]: `%${filters.search}%` }
    }));
  }
  if (filters.isActive !== undefined) {
    where.is_active = filters.isActive;
  }
  if(filters.status===false || filters.status===true){
    // console.log("status3: ",filters.status);
    where.status=filters.status
  }
  if(filters.category){
    where.ingredient_category_id=filters.category
  }
  if (filters.fromDate) {
    where.createdAt = { ...(where.createdAt || {}), [Op.gte]: filters.fromDate };
  }
  if (filters.toDate) {
    where.createdAt = { ...(where.createdAt || {}), [Op.lte]: filters.toDate };
  }
  if(filters.rolebrand){
    where.rolebrand=filters.rolebrand
  }
  if(filters.province){
    where.province=filters.province
  }
  const queryOptions = {
    attributes,
    where,
    order: orderClaude || [[orderBy, order]],
    limit,
    offset,
    include,
  };

  if (group) {
    queryOptions.group = group;
  }
  // --- Query with Sequelize ---
  const { rows, count } = await model.findAndCountAll(queryOptions);

  return {
    data: rows,
    total: count,
    page,
    size,
    totalPages: Math.ceil(count / size)
  };
}

module.exports = { getPagination };
