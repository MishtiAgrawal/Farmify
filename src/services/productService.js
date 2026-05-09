exports.buildProductQuery = ({ q, category }) => {
  const query = {};

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = category;
  }

  return query;
};
