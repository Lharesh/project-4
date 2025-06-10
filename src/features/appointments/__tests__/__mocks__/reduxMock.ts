import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import React from 'react';

let mockState: any = undefined;

export function setMockState(state: any) {
  mockState = state;
}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector(mockState),
}));

export function setupReduxMock() {
  beforeEach(() => {
    mockState = undefined;
  });
}

