/* eslint-disable no-unused-vars */
const clearAllField = () => {
  document.getElementById('Name').value = null;
  document.getElementById('DateOfBirth').value = null;
  document.getElementById('State').value = null;
  document.getElementById('Area').value = null;
  document.getElementById('Street').value = null;
  document.getElementById('Phone number').value = null;
  document.getElementById('Email Address').value = null;
  document.getElementById('company').value = null;
  document.getElementById('college').value = null;
  document.getElementById('overview').value = null;
};

const formatPhone = (phone) => {
  // normalize string and remove all unnecessary characters
  const phoneReformat = phone.replace(/[^\d]/g, '');

  // check if number length equals to 10
  if (phoneReformat.length === 10) {
    // reformat and return phone number
    return phoneReformat.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }

  return null;
};

const formatSummary = (overview) => {
  let res = overview;
  if (overview.split(' ').length > 200) {
    const t = overview.substring(0, overview.lastIndexOf(' '));
    res = t.substring(0, t.lastIndexOf(' ') + 1);
  }
  return res;
};

const verifyEmail = (email) => {
  if ((/^.+@.+\..+$/).test(email) !== true) {
    return null;
  }
  return email;
};
