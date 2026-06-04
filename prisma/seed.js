const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load .env for standalone seed runs (Prisma migrate loads it; node seed.js does not)
function loadEnvFile(filename) {
  const envPath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  });
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.report.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.document.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.beneficiaryProject.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'ayalkbet@bamah.com',
        name: 'Ayalkbet Teketel',
        password,
        role: 'admin',
        joinedDate: new Date('2023-01-15'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@engagenow.org',
        name: 'Jane Smith',
        password,
        role: 'manager',
        joinedDate: new Date('2023-05-20'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'grace.johnson@engagenow.org',
        name: 'Grace Johnson',
        password,
        role: 'manager',
        joinedDate: new Date('2023-03-01'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'james.k@engagenow.org',
        name: 'James Kipchoge',
        password,
        role: 'staff',
        joinedDate: new Date('2023-08-10'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'ruth.m@engagenow.org',
        name: 'Ruth Mwangi',
        password,
        role: 'staff',
        joinedDate: new Date('2023-09-15'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'samuel.o@engagenow.org',
        name: 'Samuel Oduor',
        password,
        role: 'donor',
        isActive: false,
        joinedDate: new Date('2023-02-28'),
      },
    }),
  ]);

  const [admin, jane, grace, james, ruth] = users;

  await prisma.organization.create({
    data: {
      name: 'Engage Now Africa',
      email: 'info@engagenow.org',
      phone: '+254 702 123456',
      country: 'Ethiopia',
      location: 'Nairobi, Kenya',
      description: 'Leading NGO focused on community development and sustainable impact.',
      totalBeneficiaries: 4670,
      childrenCount: 1240,
      womenFamiliesCount: 2100,
      communityMembersCount: 1330,
      beneficiariesThisMonth: 125,
      activePrograms: 12,
      completionRate: 86,
    },
  });

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Community Health Project',
        description: 'Delivering essential health services to underserved communities across the region.',
        status: 'on-track',
        icon: 'green',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        budget: 12000,
        spent: 8500,
        progress: 72,
        donor: 'Global Health Fund',
        managerId: jane.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Education for All',
        description: 'Expanding access to quality education for children in rural areas.',
        status: 'on-track',
        icon: 'blue',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-06-20'),
        budget: 13000,
        spent: 9200,
        progress: 85,
        donor: 'Thinking Schools',
        managerId: grace.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Clean Water Initiative',
        description: 'Building sustainable water infrastructure for rural communities.',
        status: 'at-risk',
        icon: 'amber',
        startDate: new Date('2024-03-10'),
        endDate: new Date('2024-07-10'),
        budget: 7000,
        spent: 4800,
        progress: 45,
        donor: 'Sunriders Foundation',
        managerId: jane.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Women Empowerment',
        description: 'Supporting women and families through skills training and economic empowerment.',
        status: 'delayed',
        icon: 'red',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-05-30'),
        budget: 7000,
        spent: 4000,
        progress: 38,
        donor: 'Micah Shea',
        managerId: grace.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Youth Skills Training',
        description: 'Equipping young people with vocational skills for employment.',
        status: 'on-track',
        icon: 'green',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-08-05'),
        budget: 9500,
        spent: 5700,
        progress: 60,
        donor: 'Sterling Foundation',
        managerId: james.id,
      },
    }),
  ]);

  const [health, education, water, women, youth] = projects;

  const tasks = [
    { title: 'Training session for volunteers', projectId: health.id, status: 'todo', priority: 'medium', dueDate: '2024-05-06', assigneeId: ruth.id },
    { title: 'Procure medical supplies', projectId: health.id, status: 'todo', priority: 'high', dueDate: '2024-05-10', assigneeId: james.id },
    { title: 'Submit quarterly report', projectId: education.id, status: 'todo', priority: 'high', dueDate: '2024-05-06', assigneeId: grace.id },
    { title: 'Vendor payment approval', projectId: water.id, status: 'todo', priority: 'medium', dueDate: '2024-05-07', assigneeId: jane.id },
    { title: 'Conduct community survey', projectId: health.id, status: 'in_progress', priority: 'high', dueDate: '2024-05-03', assigneeId: james.id },
    { title: 'Field visit to Kaimu', projectId: health.id, status: 'in_progress', priority: 'medium', dueDate: '2024-05-05', assigneeId: james.id },
    { title: 'Beneficiary registration drive', projectId: women.id, status: 'in_progress', priority: 'low', dueDate: '2024-05-12', assigneeId: ruth.id },
    { title: 'Stakeholder meeting', projectId: education.id, status: 'completed', priority: 'low', dueDate: '2024-04-28', assigneeId: grace.id },
    { title: 'Water pump site survey', projectId: water.id, status: 'completed', priority: 'medium', dueDate: '2024-04-25', assigneeId: james.id },
    { title: 'Prepare donor report', projectId: health.id, status: 'todo', priority: 'high', dueDate: '2024-05-08', assigneeId: grace.id },
    { title: 'Review field survey data', projectId: education.id, status: 'todo', priority: 'medium', dueDate: '2024-05-10', assigneeId: ruth.id },
    { title: 'Coordinate with partners', projectId: water.id, status: 'todo', priority: 'low', dueDate: '2024-05-15', assigneeId: jane.id },
    { title: 'Conduct training session', projectId: women.id, status: 'in_progress', priority: 'high', dueDate: '2024-05-05', assigneeId: ruth.id },
    { title: 'Set up monitoring system', projectId: health.id, status: 'in_progress', priority: 'medium', dueDate: '2024-05-12', assigneeId: james.id },
    { title: 'Submit quarterly report', projectId: education.id, status: 'completed', priority: 'high', dueDate: '2024-04-30', assigneeId: grace.id },
    { title: 'Finalize vendor contracts', projectId: water.id, status: 'completed', priority: 'medium', dueDate: '2024-04-25', assigneeId: jane.id },
    { title: 'Approve beneficiary list', projectId: women.id, status: 'completed', priority: 'low', dueDate: '2024-04-20', assigneeId: ruth.id },
    { title: 'Complete baseline survey', projectId: health.id, status: 'completed', priority: 'high', dueDate: '2024-04-15', assigneeId: james.id },
    { title: 'Recruit and train volunteers', projectId: health.id, status: 'in_progress', priority: 'medium', dueDate: '2024-05-08', assigneeId: ruth.id },
    { title: 'Set up health centers', projectId: health.id, status: 'todo', priority: 'high', dueDate: '2024-05-20', assigneeId: james.id },
  ];

  for (const t of tasks) {
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: new Date(t.dueDate),
        projectId: t.projectId,
        assigneeId: t.assigneeId,
      },
    });
  }

  const budgetCategories = [
    { projectId: health.id, category: 'personnel', allocated: 6000, spent: 4500 },
    { projectId: health.id, category: 'operations', allocated: 4000, spent: 2600 },
    { projectId: health.id, category: 'materials', allocated: 2000, spent: 1400 },
    { projectId: education.id, category: 'personnel', allocated: 7000, spent: 5000 },
    { projectId: education.id, category: 'operations', allocated: 4000, spent: 2800 },
    { projectId: education.id, category: 'materials', allocated: 2000, spent: 1400 },
    { projectId: water.id, category: 'personnel', allocated: 3000, spent: 2000 },
    { projectId: water.id, category: 'equipment', allocated: 2500, spent: 1800 },
    { projectId: water.id, category: 'operations', allocated: 1500, spent: 1000 },
    { projectId: women.id, category: 'personnel', allocated: 3500, spent: 2000 },
    { projectId: women.id, category: 'operations', allocated: 2000, spent: 1200 },
    { projectId: women.id, category: 'materials', allocated: 1500, spent: 800 },
  ];

  for (const b of budgetCategories) {
    await prisma.budget.create({ data: b });
  }

  const beneficiaries = [
    { name: 'Abebe Tadesse', program: 'Health', region: 'Oromia', status: 'active', enrolledDate: '2024-01-15', projectId: health.id },
    { name: 'Tigist Haile', program: 'Education', region: 'Addis Ababa', status: 'active', enrolledDate: '2024-02-01', projectId: education.id },
    { name: 'Worku Girma', program: 'WASH', region: 'South West', status: 'follow-up', enrolledDate: '2024-03-10', projectId: water.id },
    { name: 'Meron Bekele', program: 'Women Empower.', region: 'Southern', status: 'active', enrolledDate: '2024-01-20', projectId: women.id },
    { name: 'Amina Hassan', email: 'amina.hassan@example.com', program: 'Health', region: 'Nairobi', status: 'active', enrolledDate: '2023-03-15', projectId: health.id },
    { name: 'Bernard Okonkwo', email: 'bernard.o@example.com', program: 'Education', region: 'Lagos', status: 'active', enrolledDate: '2023-07-22', projectId: education.id },
    { name: 'Cynthia Mwangi', email: 'cynthia.m@example.com', program: 'Health', region: 'Nairobi', status: 'active', enrolledDate: '2023-01-10', projectId: health.id },
    { name: 'David Kipchoge', email: 'david.k@example.com', program: 'Youth', region: 'Eldoret', status: 'active', enrolledDate: '2024-02-05', projectId: youth.id },
    { name: 'Ester Abebe', email: 'ester.a@example.com', program: 'Education', region: 'Addis Ababa', status: 'active', enrolledDate: '2023-11-12', projectId: education.id },
    { name: 'Francis Mwale', email: 'francis.m@example.com', program: 'WASH', region: 'Dar es Salaam', status: 'active', enrolledDate: '2024-01-20', projectId: water.id },
    { name: 'Grace Kamau', email: 'grace.k@example.com', program: 'Health', region: 'Nairobi', status: 'active', enrolledDate: '2023-05-30', projectId: health.id },
    { name: 'Henry Njoroge', email: 'henry.n@example.com', program: 'Education', region: 'Lagos', status: 'active', enrolledDate: '2023-08-14', projectId: education.id },
  ];

  for (const b of beneficiaries) {
    const { projectId, ...data } = b;
    const beneficiary = await prisma.beneficiary.create({
      data: {
        ...data,
        enrolledDate: new Date(data.enrolledDate),
      },
    });
    await prisma.beneficiaryProject.create({
      data: { beneficiaryId: beneficiary.id, projectId, enrolledDate: new Date(data.enrolledDate) },
    });
  }

  const documents = [
    { name: 'Project Proposal.pdf', icon: '📄', category: 'contracts', projectId: health.id, fileType: 'PDF', size: '1.2 MB', uploadedAt: '2024-01-10' },
    { name: 'Q1 Financial Report.xlsx', icon: '📊', category: 'budget', projectId: null, fileType: 'XLSX', size: '1.2 MB', uploadedAt: '2024-04-05' },
    { name: 'MoU_HealthMinistry.pdf', icon: '📋', category: 'contracts', projectId: health.id, fileType: 'PDF', size: '932 KB', uploadedAt: '2024-01-20' },
    { name: 'Field Photos Apr 2024.zip', icon: '🖼️', category: 'media', projectId: water.id, fileType: 'ZIP', size: '18.5 MB', uploadedAt: '2024-04-28' },
    { name: 'Quarterly Impact Report Q1', icon: '📄', category: 'reports', projectId: health.id, fileType: 'PDF', size: '2.4 MB', uploadedAt: '2024-04-15' },
    { name: 'Project Budget 2024', icon: '📊', category: 'budget', projectId: education.id, fileType: 'XLSX', size: '1.2 MB', uploadedAt: '2024-04-10' },
    { name: 'Beneficiary Survey Data', icon: '📄', category: 'data', projectId: women.id, fileType: 'CSV', size: '856 KB', uploadedAt: '2024-04-08' },
    { name: 'Donor Agreement - Version 3', icon: '📋', category: 'contracts', projectId: water.id, fileType: 'PDF', size: '1.8 MB', uploadedAt: '2024-03-25' },
    { name: 'Staff Training Materials', icon: '📄', category: 'training', projectId: youth.id, fileType: 'PPTX', size: '5.3 MB', uploadedAt: '2024-04-12' },
    { name: 'Partnership MOU', icon: '📋', category: 'contracts', projectId: education.id, fileType: 'PDF', size: '932 KB', uploadedAt: '2024-02-14' },
    { name: 'Community Feedback Form', icon: '📄', category: 'feedback', projectId: water.id, fileType: 'DOCX', size: '256 KB', uploadedAt: '2024-04-18' },
  ];

  for (const d of documents) {
    await prisma.document.create({
      data: { ...d, uploadedAt: new Date(d.uploadedAt) },
    });
  }

  const partners = [
    { name: 'Global Health Fund', type: 'Donor', description: 'Supporting Community Health Project · $12,000', amount: 12000 },
    { name: 'Thinking Schools', type: 'Educational Partner', description: 'Education for All program support' },
    { name: 'Micah Shea', type: 'Donor', description: 'Women Empowerment & Wellbeing' },
    { name: 'Sunriders Foundation', type: 'Donor', description: 'Clean Water Initiative · $7,000', amount: 7000 },
    { name: 'Ministry of Health', type: 'Government Partner', description: 'Regional level collaboration' },
    { name: 'Sterling Foundation', type: 'Donor', description: 'WASH & Education programs' },
    { name: 'African Health Foundation', type: 'Health', description: 'Health program partner', contact: 'John Mwangi', email: 'john@ahf.org', phone: '+254 722 123456', since: 2022 },
    { name: 'Global Education Initiative', type: 'Education', description: 'Education program partner', contact: 'Sarah Johnson', email: 'sarah@gei.org', phone: '+1 202 555 0123', since: 2021 },
    { name: 'Water for Communities', type: 'WASH', description: 'WASH program partner', contact: 'Ahmed Hassan', email: 'ahmed@watercom.org', phone: '+256 701 234567', since: 2023 },
    { name: 'Women Empowerment Network', type: 'Gender', description: 'Gender program partner', contact: 'Grace Onyango', email: 'grace@wen.org', phone: '+233 24 123456', since: 2022 },
    { name: 'Youth Development Program', type: 'Youth', description: 'Youth program partner', contact: 'James Kipchoge', email: 'james@ydp.org', phone: '+254 703 234567', since: 2023 },
    { name: 'Community Foundation Ltd', type: 'Donor', description: 'Multi-program donor', contact: 'Michael Brown', email: 'michael@commfound.org', phone: '+44 20 7946 0958', since: 2021 },
  ];

  for (const p of partners) {
    await prisma.partner.create({ data: p });
  }

  const reports = [
    { name: 'Project Progress Report', description: 'Overview of all active project milestones and deliverables', reportDate: '2024-05-01' },
    { name: 'Financial Report', description: 'Detailed breakdown of income, expenses, and budget utilization', reportDate: '2024-04-30' },
    { name: 'Beneficiary Report', description: 'Feedback and satisfaction scores from recent survey', reportDate: '2024-04-28' },
    { name: 'Impact Report', description: 'Comprehensive overview of project outcomes and beneficiary impact metrics', reportDate: '2024-04-20' },
    { name: 'Quarterly Impact Report', description: 'Comprehensive overview of project outcomes and beneficiary impact metrics', reportDate: '2024-04-25' },
    { name: 'Risk & Mitigation Analysis', description: 'Identified risks, mitigation strategies, monitoring plan for Q2 2024', reportDate: '2024-04-10' },
  ];

  for (const r of reports) {
    await prisma.report.create({ data: { ...r, reportDate: new Date(r.reportDate) } });
  }

  const calendarEvents = [
    { title: 'Field Visit', date: '2024-05-01', time: '9:00 AM', color: 'green', projectId: health.id },
    { title: 'Report Due', date: '2024-05-01', allDay: true, color: 'red' },
    { title: 'Training', date: '2024-05-06', time: '10:00 AM', color: 'amber', projectId: health.id },
    { title: 'Community Event', date: '2024-05-11', time: '3:00 PM', color: 'blue', projectId: education.id },
    { title: 'Training', date: '2024-05-13', time: '10:00 AM', color: 'amber', projectId: health.id },
    { title: 'Community Event', date: '2024-05-18', time: '2:00 PM', color: 'red', projectId: women.id },
    { title: 'Field visit', date: '2024-05-05', time: '9:00 AM', color: 'green', projectId: health.id },
    { title: 'Budget review', date: '2024-05-10', time: '2:00 PM', color: 'blue' },
    { title: 'Donor meeting', date: '2024-05-15', time: '11:00 AM', color: 'green' },
    { title: 'Report due', date: '2024-05-18', allDay: true, color: 'red' },
    { title: 'Team meeting', date: '2024-05-22', time: '3:00 PM', color: 'amber' },
  ];

  for (const e of calendarEvents) {
    await prisma.calendarEvent.create({
      data: {
        title: e.title,
        date: new Date(e.date),
        time: e.time,
        allDay: e.allDay || false,
        color: e.color,
        projectId: e.projectId || null,
      },
    });
  }

  const activities = [
    { action: 'completed', entity: 'task', entityId: 'seed', description: 'Task completed by James K.', userId: james.id, projectId: health.id },
    { action: 'updated', entity: 'budget', entityId: 'seed', description: 'Budget updated', userId: grace.id, projectId: education.id },
    { action: 'created', entity: 'beneficiary', entityId: 'seed', description: 'New beneficiary added', userId: jane.id, projectId: water.id },
    { action: 'uploaded', entity: 'document', entityId: 'seed', description: 'Document uploaded', userId: grace.id, projectId: women.id },
  ];

  for (const a of activities) {
    await prisma.activity.create({ data: a });
  }

  console.log('Seed completed successfully!');
  console.log('Login credentials: ayalkbet@bamah.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
