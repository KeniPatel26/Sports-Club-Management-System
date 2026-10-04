const localImageFallbacks = {
  'photo-1626700051175-6818013e1d4f': '/images/menu/chicken-avocado-wrap.svg',
  'photo-1604382354936-07c5d9983bd3': '/images/menu/truffle-mushroom-pizza.svg',
};

/** Use local artwork for seed image URLs that cannot be fetched in this environment. */
export const menuImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  const fallback = Object.entries(localImageFallbacks).find(([photoId]) => imageUrl.includes(photoId));
  return fallback?.[1] || imageUrl;
};
