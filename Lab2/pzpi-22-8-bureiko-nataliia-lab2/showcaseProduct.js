let showcaseProductId = null;

const getShowcaseProduct = () => showcaseProductId;
const setShowcaseProduct = (id) => {
  showcaseProductId = id;
};

module.exports = { getShowcaseProduct, setShowcaseProduct };