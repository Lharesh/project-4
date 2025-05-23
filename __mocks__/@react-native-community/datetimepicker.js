const React = require('react');
module.exports = ({ onChange }) => {
  // Expose the onChange for test simulation
  global.__TEST_DATE_PICKER_ONCHANGE__ = onChange;
  return null;
};
