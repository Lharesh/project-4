import { getRecommendedSlots, RecommendationCriteria, SlotRecommendation } from '../helpers/recommendationHelpers';

describe('getRecommendedSlots', () => {
  const mockMatrix = [
    {
      roomNumber: '101',
      slots: [
        {
          slot: '09:00',
          isRoomAvailable: true,
          isBooked: false,
          availableTherapists: [
            { id: 't1', gender: 'male' },
            { id: 't2', gender: 'female' }
          ]
        },
        {
          slot: '10:00',
          isRoomAvailable: true,
          isBooked: false,
          availableTherapists: [
            { id: 't3', gender: 'other' }
          ]
        }
      ]
    },
    {
      roomNumber: '102',
      slots: [
        {
          slot: '09:00',
          isRoomAvailable: false,
          isBooked: true,
          availableTherapists: []
        }
      ]
    }
  ];

  it('returns empty array if patient is not found', () => {
    const criteria: RecommendationCriteria = {
      originalSlot: '09:00',
      originalTherapistIds: ['t1'],
      patientId: 'notfound',
      date: '2025-06-01',
      matrix: mockMatrix as any
    };
    expect(getRecommendedSlots(criteria)).toEqual([]);
  });

  it('returns recommendations for same therapist and same gender', () => {
    // Patient with gender 'female' exists in PATIENTS mock
    const criteria: RecommendationCriteria = {
      originalSlot: '09:00',
      originalTherapistIds: ['t2'],
      patientId: 'p2', // Should match a female patient in PATIENTS mock
      date: '2025-06-01',
      matrix: mockMatrix as any
    };
    const results = getRecommendedSlots(criteria);
    expect(results.some(r => r.reason === 'same therapist')).toBe(true);
    expect(results.some(r => r.reason === 'same gender')).toBe(true);
  });

  it('does not return slots for unavailable or booked rooms', () => {
    const criteria: RecommendationCriteria = {
      originalSlot: '09:00',
      originalTherapistIds: ['t1'],
      patientId: 'p1',
      date: '2025-06-01',
      matrix: [
        {
          roomNumber: '102',
          slots: [
            {
              slot: '09:00',
              isRoomAvailable: false,
              isBooked: true,
              availableTherapists: [
                { id: 't1', gender: 'male' }
              ]
            }
          ]
        }
      ] as any
    };
    expect(getRecommendedSlots(criteria)).toEqual([]);
  });

  it('returns "other" reason if therapist is not same or same gender', () => {
    const criteria: RecommendationCriteria = {
      originalSlot: '10:00',
      originalTherapistIds: ['t1'],
      patientId: 'p1', // Should match a male patient in PATIENTS mock
      date: '2025-06-01',
      matrix: mockMatrix as any
    };
    const results = getRecommendedSlots(criteria);
    expect(results.some(r => r.reason === 'other')).toBe(true);
  });
});
