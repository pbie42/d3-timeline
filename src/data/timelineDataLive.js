import moment from 'moment';

export default {
  startTime: +moment()
    .utc()
    .subtract(15, 'm')
    .format('x'),
  doNotDisturb: [
    {
      startTime: +moment()
        .utc()
        .add(1, 'h')
        .format('x'),
      endTime: +moment()
        .utc()
        .add(2, 'h')
        .format('x')
    }
  ],
  events: [
    {
      label: 'Breakfast',
      startTime: +moment()
        .utc()
        .subtract(30, 'm')
        .format('x'),
      endTime: +moment()
        .utc()
        .add(30, 'm')
        .format('x')
    },
    {
      label: 'Metro',
      startTime: +moment()
        .utc()
        .add(30, 'm')
        .format('x'),
      endTime: +moment()
        .utc()
        .add(60, 'm')
        .format('x')
    },
    {
      label: 'Gym',
      startTime: +moment()
        .utc()
        .add(1, 'h')
        .format('x'),
      endTime: +moment()
        .utc()
        .add(3, 'h')
        .format('x')
    },
    {
      label: 'Metro',
      startTime: +moment()
        .utc()
        .add(3, 'h')
        .format('x'),
      endTime: +moment()
        .utc()
        .add(3, 'h')
        .add(30, 'm')
        .format('x')
    },
    {
      label: 'Lunch',
      startTime: +moment()
        .utc()
        .add(3, 'h')
        .add(30, 'm')
        .format('x'),
      endTime: +moment()
        .utc()
        .add(5, 'h')
        .add(30, 'm')
        .format('x')
    },
    {
      label: 'Bank',
      startTime: +moment()
        .utc()
        .add(5, 'h')
        .add(30, 'm')
        .format('x'),
      endTime: +moment()
        .utc()
        .add(6, 'h')
        .format('x')
    },
    {
      label: 'Code',
      startTime: +moment()
        .utc()
        .add(6, 'h')
        .format('x'),
      endTime: +moment()
        .utc()
        .add(10, 'h')
        .format('x')
    },
    {
      label: 'Games',
      startTime: +moment()
        .utc()
        .add(10, 'h')
        .format('x'),
      endTime: +moment()
        .utc()
        .add(13, 'h')
        .format('x')
    }
  ],
  taskGroups: [
    {
      name: 'Important',
      tasks: [
        {
          title: 'Cook',
          startTime: +moment()
            .utc()
            .subtract(15, 'm')
            .format('x'),
          endTime: +moment()
            .utc()
            .format('x'),
          severity: 'SEVERE'
        },
        {
          title: 'Read Paper',
          startTime: +moment()
            .utc()
            .subtract(10, 'm')
            .format('x'),
          endTime: +moment()
            .utc()
            .add(15, 'm')
            .format('x'),
          severity: 'MODERATE'
        },
        {
          title: 'Brush Teeth',
          startTime: +moment()
            .utc()
            .add(15, 'm')
            .format('x'),
          endTime: +moment()
            .utc()
            .add(20, 'm')
            .format('x'),
          severity: 'Severe'
        },
        {
          title: 'Hydrate',
          startTime: +moment()
            .utc()
            .add(1, 'h')
            .add(30, 'm')
            .format('x'),
          endTime: +moment()
            .utc()
            .add(1, 'h')
            .add(35, 'm')
            .format('x'),
          severity: 'SEVERE'
        },
        {
          title: 'Pump Iron',
          startTime: +moment()
            .utc()
            .add(1, 'h')
            .add(15, 'm')
            .format('x'),
          endTime: +moment()
            .utc()
            .add(2, 'h')
            .add(15, 'm')
            .format('x'),
          severity: 'SEVERE'
        },
        {
          title: 'Quick Pause',
          startTime: +moment()
            .utc()
            .add(2, 'h')
            .format('x'),
          endTime: +moment()
            .utc()
            .add(2, 'h')
            .add(15, 'm')
            .format('x'),
          severity: 'MODERATE'
        },
        {
          title: 'Hydrate',
          startTime: +moment()
            .utc()
            .add(2, 'h')
            .format('x'),
          endTime: +moment()
            .utc()
            .add(2, 'h')
            .add(5, 'm')
            .format('x'),
          severity: 'SEVERE'
        }
      ]
    },
    {
      name: 'Regular',
      tasks: [
        {
          title: 'Clean Dishes',
          startTime: +moment()
            .utc()
            .add(10, 'm')
            .format('x'),
          endTime: +moment()
            .utc()
            .add(15, 'm')
            .format('x'),
          severity: 'MODERATE'
        },
        {
          title: 'Rinse Bottle',
          startTime: +moment()
            .utc()
            .add(10, 'm')
            .format('x'),
          endTime: +moment()
            .utc()
            .add(15, 'm')
            .format('x'),
          severity: 'SEVERE'
        }
      ]
    }
  ]
};
