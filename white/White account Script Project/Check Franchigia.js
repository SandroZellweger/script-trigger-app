function countFranchigiaSiEvents() {
  const calendarIds = [
    'noleggiosemplice23@gmail.com',
    'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com',
    'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com',
    'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com',
    '25f71a841f7ac3252fc9f1ced1870596d23a1842ae48ed39ede7f3bc01e819ca@group.calendar.google.com',
    '8c2a425fa75bf5230dd2eee2a5cbedfcfa01279e943b5817efa25dfb359d8920@group.calendar.google.com',
    'aa19b3fbefcdee63ffa1b724e3a2f4c65ed49949db2e6cf3d40e13924daea94b@group.calendar.google.com',
    '6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com',
    '9535c25ccd3adc5dc5a908aa9055cd8893e547657d6257f0a0232d50214c8c99@group.calendar.google.com',
    'a97fc8429fc9a143475e0244ad922ce0f6dfb025a88dd68baadd116ef4f0b5cc@group.calendar.google.com',
    '0e9a455f793914439c9ae0e5ef91790038aa8fc295e71cfacbc3b8f128def8fa@group.calendar.google.com'
  ];

  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-12-31');
  let count = 0;

  calendarIds.forEach(id => {
    const calendar = CalendarApp.getCalendarById(id);
    const events = calendar.getEvents(startDate, endDate);

    events.forEach(event => {
      const desc = event.getDescription();
      if (/Franchigia:\s*Si/i.test(desc)) {
        count++;
      }
    });
  });

  Logger.log('Number of events with Franchigia: Si = ' + count);
  return count;
}
