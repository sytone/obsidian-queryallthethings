---
order: 20
parent: Data Tables
title: Reference - Calendar Table
---

# Reference - Calendar Table

Table Name: `qatt.ReferenceCalendar`

The reference calendar is used to help with date based management, you can directly query the table or use it to join to other data sources.

| Column Name      | Type    | Description                                                               |
| ---------------- | ------- | ------------------------------------------------------------------------- |
| date             | string  | date.toISODate()                                                          |
| day              | number  | date.day                                                                  |
| month            | number  | date.month                                                                |
| year             | number  | date.year                                                                 |
| dayOfWeek        | number  | date.weekday                                                              |
| dayOfYear        | number  | date.ordinal                                                              |
| weekOfYear       | number  | date.weekNumber                                                           |
| weekOfMonth      | number  | date.weekNumber - DateTime.local(date.year, date.month, 1).weekNumber + 1 |
| quarter          | number  | Math.ceil(date.month / 3)                                                 |
| isLeapYear       | boolean | date.isInLeapYear                                                         |
| isToday          | boolean | date.hasSame(DateTime.now(), 'day')                                       |
| isWeekend        | boolean | date.weekday > 5                                                          |
| isFuture         | boolean | date > DateTime.now()                                                     |
| isPast           | boolean | date < DateTime.now()                                                     |
| isCurrentMonth   | boolean | date.month === DateTime.now().month                                       |
| isCurrentYear    | boolean | date.year === DateTime.now().year                                         |
| isCurrentQuarter | boolean | Math.ceil(date.month / 3) === Math.ceil(DateTime.now().month / 3)         |
| isCurrentWeek    | boolean | date.weekNumber === DateTime.now().weekNumber                             |
| isCurrentDay     | boolean | date.hasSame(DateTime.now(), 'day')                                       |