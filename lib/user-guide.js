export const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of navigating the Engage Now Africa platform and setting up your profile.',
    icon: 'rocket',
    subtopics: ['System Navigation', 'User Profile Setup', 'Role Permissions'],
  },
  {
    id: 'projects',
    title: 'Project & Task Workflow',
    description: 'Manage project lifecycles, assign tasks, and track progress across your programs.',
    icon: 'folder',
    subtopics: ['Creating Projects & Phases', 'Task Assignment', 'Kanban Board Usage'],
  },
  {
    id: 'operations',
    title: 'Logistics & Beneficiaries',
    description: 'Register assets, track beneficiaries, and manage field operations data.',
    icon: 'truck',
    subtopics: ['Asset Registrations', 'Beneficiary Data Entry', 'Document Uploads'],
  },
  {
    id: 'reports',
    title: 'Reports & Compliance',
    description: 'Submit field reports, track approvals, and maintain donor compliance.',
    icon: 'chart',
    subtopics: ['Activity Report Tables', 'Report Approval Flow', 'Google Drive Attachments'],
  },
];

export const HELP_FAQ = [
  {
    id: 'budget',
    question: 'How do I request a budget increase?',
    answer: 'Open the project, go to the Budget tab, and contact your Project Manager or General Country Dean with the updated figures. Budget changes require dean or manager approval.',
  },
  {
    id: 'offline',
    question: 'What happens if I lose internet while submitting a report?',
    answer: 'Save your report as a draft before submitting. Drafts are stored on the server once saved — you can return and complete submission when connectivity returns.',
  },
  {
    id: 'roles',
    question: 'What are the three user roles?',
    answer: 'General Country Dean has full organizational access. Project Manager / Lead manages assigned projects. Staff work on assigned projects and tasks only.',
  },
  {
    id: 'approval',
    question: 'How long does report approval take?',
    answer: 'Reports appear in the Reports Approval queue immediately after submission. Your Project Manager or Dean will review planned vs reported data and approve or return for revision.',
  },
];

export const SUPPORT_TICKET_CATEGORIES = [
  'General Support',
  'Account & Access',
  'Projects & Tasks',
  'Reports & M&E',
  'Technical Issue',
];

export const HQ_CONTACT = {
  email: 'support@engagenowafrica.org',
  phone: '+251 11 000 0000',
  hours: 'Mon – Fri, 8:30 AM – 5:30 PM EAT',
};

/** Legacy accordion sections (search indexing) */
export const USER_GUIDE_SECTIONS = HELP_CATEGORIES.map((cat) => ({
  id: cat.id,
  title: cat.title,
  subtitle: cat.description,
  icon: cat.icon,
  items: cat.subtopics.map((s) => ({ title: s, body: cat.description })),
}));

export const USER_GUIDE_ITEMS = USER_GUIDE_SECTIONS.flatMap((s) =>
  s.items.map((item) => ({ title: item.title, body: item.body })),
);
