// utils/pagination.js
const { Op } = require("sequelize");

async function getPagination({
  model,         // Sequelize model (vd: User, Product)
  attributes=[],
  page = 1,
  size = 10,
  filters = {},  // { search, isActive, fromDate, toDate }
  orderBy = "create_at",
  order = "ASC",
  searchFields = ["name"], // cột được tìm kiếm khi có search
  where = {} , // custom where thêm ngoài filters
  include = []  
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
    where.category_id=filters.category
  }
  if (filters.fromDate) {
    where.createdAt = { ...(where.createdAt || {}), [Op.gte]: filters.fromDate };
  }
  if (filters.toDate) {
    where.createdAt = { ...(where.createdAt || {}), [Op.lte]: filters.toDate };
  }

  // --- Query with Sequelize ---
  const { rows, count } = await model.findAndCountAll({
    attributes,
    where,
    order: [[orderBy, order]],
    limit,
    offset,
    include,
  });

  return {
    data: rows,
    total: count,
    page,
    size,
    totalPages: Math.ceil(count / size)
  };
}

module.exports = { getPagination };
