# Architecture Overview

This document provides a high-level overview of the application's architecture, including diagrams for component hierarchy, data flow, and directory structure.

---

## 1. Component Hierarchy
```mermaid
graph TD;
  App[App.tsx]
  App --> Nav[NavigationContainer]
  Nav --> Home[HomeScreen]
  Nav --> Appointments[AppointmentsScreen]
  Nav --> Clients[ClientsScreen]
  Appointments --> NewAppointment[NewAppointmentModal]
  Appointments --> RecurringPreview[RecurringSlotPreview]
  Appointments --> TherapyForm[TherapyAppointments]
  Clients --> ClientForm[ClientForm]
```

---

## 2. Data Flow (Redux & API)
```mermaid
flowchart TD
  UI[UI Components] -->|dispatch actions| Redux[Redux Store]
  Redux -->|fetches data| API[API Layer]
  API -->|returns data| Redux
  Redux -->|provides state| UI
```

---

## 3. Directory Structure
See main [README.md](README.md) for the Mermaid diagram.

---

## 4. Design Principles
- **Mobile-first:** All UI uses React Native primitives.
- **Separation of Concerns:** Features, theme, and localization are modularized.
- **Testability:** All logic is covered by Jest tests.
- **Accessibility:** Components use accessibility labels and testIDs.
