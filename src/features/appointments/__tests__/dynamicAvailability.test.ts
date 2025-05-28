import { addDynamicAvailability } from '../helpers/dynamicAvailability';

describe('dynamicAvailability', () => {
  const testDate = '2099-07-04';
  const localWeekday = new Date(testDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const utcWeekday = new Date(Date.UTC(2099, 6, 4, 0, 0, 0)).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase();
  console.log('Weekday for', testDate, 'local:', localWeekday);
  console.log('Weekday for', testDate, 'UTC:', utcWeekday);
  const clinicTimings = {
    weekdays: {
      [localWeekday]: { isOpen: true, start: '10:00', end: '12:00', status: 'working' }
    }
  };
  const mondayDate = testDate;

  it('adds dynamic availability to rooms and blocks slots by appointments (detected weekday)', () => {
    const entities = [
      { id: 'r1' }
    ];
    const appointments = [
      { id: 'a1', date: testDate, slot: '10:00', roomId: 'r1' }
    ];
    const result = addDynamicAvailability({
      entities,
      entityType: 'room',
      date: testDate,
      appointments,
      clinicTimings,
      slotDuration: 30
    });
    console.log('Room slots (with appointment at 10:00):', result[0].availability[testDate]);
    expect(result[0].availability[testDate]).toContain('10:30');
    expect(result[0].availability[testDate]).toContain('11:00');
    expect(result[0].availability[testDate]).not.toContain('10:00');
  });

  it('generates slots for rooms when there are no appointments (detected weekday)', () => {
    const entities = [ { id: 'r1' } ];
    const appointments: any[] = [];
    const result = addDynamicAvailability({
      entities,
      entityType: 'room',
      date: testDate,
      appointments,
      clinicTimings,
      slotDuration: 30
    });
    console.log('Room slots (no appointments):', result[0].availability[testDate]);
    expect(result[0].availability[testDate].length).toBeGreaterThan(0);
  });

  it('generates more slots with shorter slotDuration (detected weekday)', () => {
    const entities = [ { id: 'r1' } ];
    const appointments: any[] = [];
    const result15 = addDynamicAvailability({
      entities,
      entityType: 'room',
      date: testDate,
      appointments,
      clinicTimings,
      slotDuration: 15
    });
    const result30 = addDynamicAvailability({
      entities,
      entityType: 'room',
      date: testDate,
      appointments,
      clinicTimings,
      slotDuration: 30
    });
    console.log('Room slots (slotDuration 15):', result15[0].availability[testDate]);
    console.log('Room slots (slotDuration 30):', result30[0].availability[testDate]);
    expect(result15[0].availability[testDate].length).toBeGreaterThan(result30[0].availability[testDate].length);
  });

  it('adds dynamic availability to therapists (with and without initial availability, detected weekday)', () => {
    const therapists = [
      { id: 't1', gender: 'male' },
      { id: 't2', gender: 'female' }
    ];
    const appointments = [
      { id: 'a1', date: testDate, slot: '10:00', therapistIds: ['t1'] }
    ];
    const result = addDynamicAvailability({
      entities: therapists,
      entityType: 'therapist',
      date: testDate,
      appointments,
      clinicTimings,
      slotDuration: 30
    });
    // t1 should not have 10:00 (booked), but should have 10:30 and 11:00
    expect(result[0].availability[testDate]).toContain('10:30');
    expect(result[0].availability[testDate]).toContain('11:00');
    expect(result[0].availability[testDate]).not.toContain('10:00');
    // t2 should have all slots
    expect(result[1].availability[testDate]).toContain('10:00');
    expect(result[1].availability[testDate]).toContain('10:30');
    expect(result[1].availability[testDate]).toContain('11:00');
  });

  it('adds roomNumber property for rooms if missing', () => {
    const entities = [
      { id: 'r2' } // no roomNumber
    ];
    const appointments: any[] = [];
    const result = addDynamicAvailability({
      entities,
      entityType: 'room',
      date: testDate,
      appointments,
      clinicTimings,
      slotDuration: 30
    });
    expect(result[0].roomNumber).toBe('r2');
  });

  it('slotDuration affects the number of generated slots (detected weekday)', () => {
    const entities = [ { id: 'r1' } ];
    const appointments: any[] = [];
    const result30 = addDynamicAvailability({
      entities,
      entityType: 'room',
      date: testDate,
      appointments,
      clinicTimings,
      slotDuration: 30
    });
    const result60 = addDynamicAvailability({
      entities,
      entityType: 'room',
      date: testDate,
      appointments,
      clinicTimings,
      slotDuration: 60
    });
    expect(result30[0].availability[testDate].length).toBeGreaterThan(result60[0].availability[testDate].length);
  });
});
