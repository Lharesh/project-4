import { Calendar, Users, BarChart3, Settings, ShoppingBasketIcon } from 'lucide-react-native';

export type TabConfig = {
  name: string;             // used in router/navigation
  title?: string;           // used as tab bar label
  label?: string;           // used in admin menu
  route?: string;           // used for admin menu routing
  icon: React.ElementType;  // icon component, not JSX!
  type: 'main' | 'admin';   // defines if it's a tab or menu item
};

export const ROLE_TABS: Record<string, TabConfig[]> = {
  admin: [
    { name: 'appointments', title: 'Appointments', icon: Calendar, type: 'main' },
    { name: 'clients', title: 'Clients', icon: Users, type: 'main' },
  ],

  doctor: [
    { name: 'appointments', title: 'Appointments', icon: Calendar, type: 'main' },
    { name: 'clients', title: 'Clients', icon: Users, type: 'main' },
  ],

  receptionist: [
    { name: 'appointments', title: 'Appointments', icon: Calendar, type: 'main' },
    { name: 'clients', title: 'Clients', icon: Users, type: 'main' },
  ],

  therapist: [
    { name: 'appointments', title: 'Appointments', icon: Calendar, type: 'main' },
  ],

  guest: [],
  client: [],
};
