export const USER_GUIDE_SECTIONS = [
  {
    id: 'start',
    title: 'Getting Started',
    subtitle: 'Login, navigation, and roles',
    icon: '🏠',
    items: [
      {
        title: 'Signing in',
        body: 'Use your NGO email and password on the login page. Your browser may ask for location permission — this helps record sign-in location for security.',
      },
      {
        title: 'Three roles in the system',
        body: 'General Country Dean has full access. Project Manager / Lead manages assigned projects. Staff works on assigned projects and tasks only.',
      },
      {
        title: 'Navigation',
        body: 'Use the top bar (Home, Programs, Reports, Operations, Admin) and the sidebar search to move between modules quickly.',
      },
    ],
  },
  {
    id: 'programs',
    title: 'Programs & Projects',
    subtitle: 'Projects, tasks, budget, M&E',
    icon: '📋',
    items: [
      {
        title: 'Managing projects',
        body: 'Open Programs → Projects to view all initiatives. Project Managers can create tasks, add team members, and track outcomes on assigned projects.',
      },
      {
        title: 'Tasks & dates',
        body: 'Each task has a start date and end date. Use the kanban board to drag tasks between To Do, In Progress, and Completed.',
      },
      {
        title: 'Budget tracking',
        body: 'Budget bars turn yellow above 75% spent and red above 90% spent. Review utilization on the Dashboard and Budget pages.',
      },
      {
        title: 'M&E logframe',
        body: 'Within each project, use Outcomes, Outputs, and Activities tabs to define what was planned — this feeds report approval comparisons.',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports & Approval',
    subtitle: 'Digital paper-format reporting',
    icon: '📊',
    items: [
      {
        title: 'Submitting a report',
        body: 'Go to Reports → choose report type → New Report. Fill the executive summary, narrative, and the Activity Report Table (planned vs achieved columns). Add a Google Drive link for supporting files.',
        tips: ['Report date defaults to today.', 'Last updated timestamp appears on each report.'],
      },
      {
        title: 'Activity report table',
        body: 'The table mirrors the paper NGO reporting format: Activity/Output, Indicator, Planned Target, Achieved, Unit, Location, and Remarks. Add rows as needed.',
      },
      {
        title: 'Approval workflow',
        body: 'Approvers see a Planned vs Reported comparison against the project logframe. They can approve or return reports for revision.',
      },
      {
        title: 'Editing after approval',
        body: 'Approved reports can still be edited. When changed after approval, an "Edited after approved" tag appears for both author and approver.',
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    subtitle: 'Beneficiaries, documents, logistics',
    icon: '🌍',
    items: [
      {
        title: 'Beneficiaries',
        body: 'Record and filter beneficiaries by program, region, and status under Operations → Beneficiaries.',
      },
      {
        title: 'Documents',
        body: 'Upload PDFs and files — PDF cover thumbnails display automatically on document cards.',
      },
      {
        title: 'Inbox & messages',
        body: 'Project and task messages appear in Inbox. Notifications in the top bar link to pending items.',
      },
    ],
  },
  {
    id: 'admin',
    title: 'Administration',
    subtitle: 'Staff, settings, audit',
    icon: '⚙️',
    items: [
      {
        title: 'Staff management',
        body: 'Deans add staff with one of three roles only: General Country Dean, Project Manager / Lead, or Staff.',
      },
      {
        title: 'Settings',
        body: 'Configure organization profile, date/time, locations, units, and indicators under Admin → Settings.',
      },
      {
        title: 'Audit & security',
        body: 'Sign-in events record IP and location. Deans can review audit logs for accountability.',
      },
    ],
  },
];

/** @deprecated use USER_GUIDE_SECTIONS */
export const USER_GUIDE_ITEMS = USER_GUIDE_SECTIONS.flatMap((s) =>
  s.items.map((item) => ({ title: item.title, body: item.body })),
);
