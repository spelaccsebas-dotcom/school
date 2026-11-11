import moment from 'moment';

// Datums uit de database komen zonder tijdzone binnen, maar zijn UTC.
export const utcDate = (value) => moment.utc(value).toDate();
export const timeAgo = (value) => moment.utc(value).fromNow();