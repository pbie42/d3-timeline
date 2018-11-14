export default {
  startTime: 1541664000000, // 8/11/18 08:00:00
  endTime: 1541714400000, // 8/11/18 20:00:00
  events: [
    {
      label: 'Breakfast',
      startTime: 1541664000000, // 8/11/18 08:00:00
      endTime: 1541667600000 // 8/11/18 09:00:00
    },
    {
      label: 'Metro',
      startTime: 1541667600000, // 8/11/18 09:00:00,
      endTime: 1541669400000 // 8/11/18 09:30:00
    },
    {
      label: 'Gym',
      startTime: 1541669400000, // 8/11/18 09:30:00
      endTime: 1541676600000 // 8/11/18 11:30:00
    },
    {
      label: 'Metro',
      startTime: 1541676600000, // 8/11/18 11:30:00
      endTime: 1541678400000 // 8/11/18 12:00:00
    },
    {
      label: 'Lunch',
      startTime: 1541678400000, // 8/11/18 12:00:00
      endTime: 1541685600000 // 8/11/18 14:00:00
    },
    {
      label: 'Bank',
      startTime: 1541685600000, // 8/11/18 14:00:00
      endTime: 1541689200000 // 8/11/18 15:00:00
    },
    {
      label: 'Code',
      startTime: 1541689200000, // 8/11/18 15:00:00
      endTime: 1541703600000 // 8/11/18 19:00:00
    },
    {
      label: 'Games',
      startTime: 1541703600000, // 8/11/18 19:00:00
      endTime: 1541714400000 // 8/11/18 22:00:00
    }
  ],
  taskGroups: [
    {
      name: 'Important',
      tasks: [
        {
          title: 'Cook',
          startTime: 1541664900000, // 8:15
          endTime: 1541665800000, // 8:30
          severity: 'SEVERE'
        },
        {
          title: 'Read Paper',
          startTime: 1541665200000, // 8:20
          endTime: 1541666400000, // 8:40
          severity: 'MODERATE'
        },
        {
          title: 'Brush Teeth',
          startTime: 1541666100000, // 8:35
          endTime: 1541666400000, // 8:40
          severity: 'Severe'
        },
        {
          title: 'Hydrate',
          startTime: 1541673900000, // 10:45
          endTime: 1541674200000, // 10:50
          severity: 'SEVERE'
        },
        {
          title: 'Pump Iron',
          startTime: 1541670300000, // 9:45
          endTime: 1541675700000, // 11:15
          severity: 'SEVERE'
        },
        {
          title: 'Hydrate',
          startTime: 1541676600000, // 11:30
          endTime: 1541676900000, // 11:35
          severity: 'SEVERE'
        }
      ]
    },
    {
      name: 'Regular',
      tasks: [
        {
          title: 'Clean Dishes',
          startTime: 1541666700000, // 8:45
          endTime: 1541667600000, // 9:00
          severity: 'MODERATE'
        },
        {
          title: 'Rinse Bottle',
          startTime: 1541666700000, // 8:45
          endTime: 1541667600000, // 9:00
          severity: 'SEVERE'
        }
      ]
    }
  ]
}
