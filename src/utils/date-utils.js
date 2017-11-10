import moment from 'moment';

function now() {
  return moment.utc().format();
}

export default {
  now,
};
