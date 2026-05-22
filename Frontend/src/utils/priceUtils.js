// Frontend/src/utils/priceUtils.js
export const extractPrice = (priceString) => {
  if (!priceString) return 0;
  // Extract numbers from strings like "₹1099/-", "₹1,099", "1099"
  const match = priceString.toString().match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

export const formatPrice = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}/-`;
};