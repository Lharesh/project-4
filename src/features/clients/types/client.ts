export interface Client {
  id: string;
  name: string;
  mobile: string;
  altMobile?: string;
  gender: 'Male' | 'Female' | 'Other';
  email?: string;
  dob?: string;
  height?: number;
  weight?: number;
  presentComplaints?: string;
  knownIssues?: string[];
  pastIllnesses?: string;
  allergies?: string;
  familyHistory?: string;
  currentMedication?: string;
  prefix?: string;
  age?: string;
}
