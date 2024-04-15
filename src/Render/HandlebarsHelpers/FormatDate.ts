import {DateTime} from 'luxon';

export function formatDate(value: number) {
  return DateTime.fromMillis(value).toFormat('yyyy-MM-dd');
}
