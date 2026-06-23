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
  await prisma.taskDeliverable.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.logisticsShipment.deleteMany();
  await prisma.pinnedProject.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.message.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.report.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.document.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.beneficiaryProject.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.userScopeMapping.deleteMany();
  await prisma.reportWorkflowRule.deleteMany();
  await prisma.programIndicator.deleteMany();
  await prisma.orgUnit.deleteMany();
  await prisma.planActivity.deleteMany();
  await prisma.planOutput.deleteMany();
  await prisma.planOutcome.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('123456789', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'ayalkbet@bamah.com',
        name: 'Ayalkbet Teketel',
        password,
        role: 'dean',
        joinedDate: new Date('2023-01-15'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@engagenow.org',
        name: 'Jane Smith',
        password,
        role: 'project_manager',
        joinedDate: new Date('2023-05-20'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'grace.johnson@engagenow.org',
        name: 'Grace Johnson',
        password,
        role: 'project_manager',
        joinedDate: new Date('2023-03-01'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'james.k@engagenow.org',
        name: 'James Kipchoge',
        password,
        role: 'staff',
        staffRole: 'field_worker',
        joinedDate: new Date('2023-08-10'),
      },
    }),
    prisma.user.create({
      data: {
        email: 'ruth.m@engagenow.org',
        name: 'Ruth Mwangi',
        password,
        role: 'staff',
        staffRole: 'finance_team',
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
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Africa/Addis_Ababa',
      fiscalYearStart: 'July',
      landingTitle: 'Engage Now Africa',
      landingSubtitle: "Welcome to Engage Now Africa's Impact Portal – a space to track how we heal, rescue, and lift vulnerable individuals, families, and communities across Africa.",
      landingTagline: 'Empowering Communities Since 2010',
      missionText: 'To heal, rescue, and lift vulnerable individuals, families, and communities through sustainable development programs in health, education, water, and anti-trafficking initiatives.',
      visionText: 'A transformed Africa where every community has access to clean water, quality education, dignified livelihoods, and protection from exploitation.',
      strategicGoals: JSON.stringify([
        'Increase access to clean water and sanitation in underserved communities',
        'Expand anti-trafficking awareness and survivor support programs',
        'Improve literacy and vocational skills for children and youth',
        'Strengthen local partnerships and community-led development',
      ]),
      primaryColor: '#2563eb',
      accentColor: '#16a34a',
      enabledRegions: JSON.stringify(['Addis Ababa', 'Amhara', 'Oromia', 'SNNPR', 'Tigray', 'Somali']),
      dashboardLayout: JSON.stringify(['kpi', 'tasks', 'budget', 'reports', 'beneficiaries', 'calendar']),
      koboEnabled: false,
      koboApiUrl: '',
      koboProjectId: '',
    },
  });

  await Promise.all([
    prisma.orgUnit.createMany({
      data: [
        { name: 'Programs & M&E', code: 'PME', description: 'Monitoring, evaluation, and program quality', sortOrder: 1 },
        { name: 'Field Operations', code: 'FIELD', description: 'Community outreach and woreda-level activities', sortOrder: 2 },
        { name: 'Finance & Compliance', code: 'FIN', description: 'Budgeting, grants, and donor reporting', sortOrder: 3 },
        { name: 'Humanitarian Response', code: 'HR', description: 'Emergency relief and incident response', sortOrder: 4 },
      ],
    }),
    prisma.programIndicator.createMany({
      data: [
        { name: 'Beneficiaries Reached', code: 'BEN-001', category: 'Impact', unit: 'people', target: 5000, baseline: 4670 },
        { name: 'Water Points Functional', code: 'WAT-001', category: 'Output', unit: 'sites', target: 120, baseline: 98 },
        { name: 'Literacy Program Completion', code: 'EDU-001', category: 'Outcome', unit: '%', target: 85, baseline: 72 },
        { name: 'Reports Submitted On Time', code: 'REP-001', category: 'Process', unit: '%', target: 95, baseline: 88 },
      ],
    }),
    prisma.reportWorkflowRule.createMany({
      data: [
        { reportType: 'daily', submitterRoles: 'staff,project_manager', approverRoles: 'dean,project_manager' },
        { reportType: 'weekly', submitterRoles: 'staff,project_manager', approverRoles: 'dean,project_manager' },
        { reportType: 'monthly', submitterRoles: 'staff,project_manager', approverRoles: 'dean,project_manager' },
        { reportType: 'quarterly', submitterRoles: 'staff,project_manager', approverRoles: 'dean,project_manager' },
        { reportType: 'biannual', submitterRoles: 'staff,project_manager', approverRoles: 'dean' },
        { reportType: 'annual', submitterRoles: 'staff,project_manager', approverRoles: 'dean' },
        { reportType: 'incident', submitterRoles: 'staff,project_manager', approverRoles: 'dean,project_manager' },
      ],
    }),
    prisma.userScopeMapping.create({
      data: { userId: james.id, region: 'Oromia', zone: 'East Shewa', woreda: 'Adama', kebele: 'Kebele 03' },
    }),
  ]);

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Kubernetes Migration',
        description: 'Run container vulnerability scans and review IAM roles.',
        status: 'on-track',
        icon: 'green',
        startDate: new Date('2025-10-15'),
        endDate: new Date('2025-12-10'),
        budget: 1000000,
        spent: 0,
        progress: 0,
        income: 500000,
        donor: 'Global Health Fund',
        donorName: 'Global Health Fund',
        assumptions: 'Stable donor funding, community participation, trained field staff available.',
        risks: 'Seasonal access challenges, supply chain delays, staff turnover.',
        indicators: 'Number of sites assessed, vulnerability scan completion rate, IAM roles reviewed.',
        outcomes: 'Improved security posture, reduced vulnerability exposure, compliant IAM policies.',
        mitigationStrategies: 'Risk: Supply delays → Mitigation: Pre-position materials. Outcome: On-time delivery.',
        locationType: 'school',
        region: 'Addis Ababa',
        zone: 'East Shewa',
        town: 'Adama',
        woreda: 'Bole',
        kebele: 'Kebele 03',
        woredaBudget: 3500000,
        managerId: jane.id,
        leadId: grace.id,
        members: {
          create: [
            { userId: james.id, role: 'member' },
            { userId: ruth.id, role: 'member' },
          ],
        },
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

  const waterOutcome = await prisma.planOutcome.create({
    data: {
      projectId: water.id,
      title: 'Communities access safe drinking water',
      description: 'Reduced waterborne disease and improved health outcomes in target woredas.',
      indicator: 'Households with access to safe water',
      targetValue: 5000,
      baseline: 3200,
      unit: 'households',
      status: 'on-track',
      progress: 62,
    },
  });

  const eduOutcome = await prisma.planOutcome.create({
    data: {
      projectId: education.id,
      title: 'Improved literacy among out-of-school children',
      description: 'Children demonstrate grade-level reading and numeracy skills.',
      indicator: 'Children meeting literacy benchmarks',
      targetValue: 1200,
      baseline: 800,
      unit: 'children',
      status: 'on-track',
      progress: 78,
    },
  });

  const waterOutput = await prisma.planOutput.create({
    data: {
      projectId: water.id,
      outcomeId: waterOutcome.id,
      title: 'Boreholes drilled and operational',
      deliverable: 'Functional water points with community management committees',
      targetQty: 24,
      achievedQty: 15,
      unit: 'sites',
      dueDate: new Date('2024-08-01'),
      status: 'in_progress',
      progress: 62,
    },
  });

  await prisma.planOutput.create({
    data: {
      projectId: education.id,
      outcomeId: eduOutcome.id,
      title: 'Community learning centers established',
      deliverable: 'Centers equipped with materials and trained facilitators',
      targetQty: 18,
      achievedQty: 14,
      unit: 'centers',
      dueDate: new Date('2024-06-15'),
      status: 'in_progress',
      progress: 78,
    },
  });

  await Promise.all([
    prisma.planActivity.create({
      data: {
        projectId: water.id,
        outputId: waterOutput.id,
        title: 'Site survey — East Shewa woredas',
        description: 'Hydrogeological assessment and community consultation for borehole placement.',
        assigneeId: james.id,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-05-15'),
        status: 'completed',
        priority: 'high',
        location: 'East Shewa, Oromia',
        progress: 100,
      },
    }),
    prisma.planActivity.create({
      data: {
        projectId: water.id,
        outputId: waterOutput.id,
        title: 'Drilling operations — Batch 3',
        assigneeId: james.id,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-06-30'),
        status: 'in_progress',
        priority: 'high',
        location: 'Adama Woreda',
        progress: 45,
      },
    }),
    prisma.planActivity.create({
      data: {
        projectId: education.id,
        title: 'Teacher facilitator training workshop',
        assigneeId: grace.id,
        startDate: new Date('2024-05-10'),
        endDate: new Date('2024-05-20'),
        status: 'planned',
        priority: 'medium',
        location: 'Addis Ababa',
        progress: 0,
      },
    }),
    prisma.planActivity.create({
      data: {
        projectId: women.id,
        title: 'Skills training — tailoring cohort',
        assigneeId: ruth.id,
        startDate: new Date('2024-05-05'),
        endDate: new Date('2024-06-05'),
        status: 'in_progress',
        priority: 'medium',
        location: 'SNNPR',
        progress: 35,
      },
    }),
  ]);

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

  const securityTask = await prisma.task.create({
    data: {
      title: 'Security Audit',
      description: 'Run container vulnerability scans and review IAM roles.',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2025-12-10'),
      projectId: health.id,
      assigneeId: james.id,
    },
  });

  await prisma.pinnedProject.create({
    data: { userId: admin.id, projectId: health.id, sortOrder: 0 },
  });

  await prisma.pinnedProject.create({
    data: { userId: jane.id, projectId: health.id, sortOrder: 0 },
  });

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
    { name: 'Daily Field Activity Log — May 24', type: 'daily', status: 'approved', description: 'Community outreach and beneficiary registration activities', content: 'Conducted door-to-door assessments in Addis Ketema woreda.', reportDate: '2024-05-24' },
    { name: 'Weekly Program Summary — Week 21', type: 'weekly', status: 'approved', description: 'Weekly milestones across health and education programs', reportDate: '2024-05-20' },
    { name: 'Monthly Operations Report — April 2024', type: 'monthly', status: 'approved', description: 'Monthly operational summary and budget utilization', reportDate: '2024-04-30' },
    { name: 'Q1 Quarterly Impact Report', type: 'quarterly', status: 'approved', description: 'Quarterly donor report on outcomes and beneficiary reach', reportDate: '2024-04-25' },
    { name: 'Mid-Year Biannual Review 2024', type: 'biannual', status: 'pending_approval', description: 'Six-month strategic review for board presentation', reportDate: '2024-05-15' },
    { name: 'Annual Impact Report 2023', type: 'annual', status: 'approved', description: 'Full-year organizational impact and financial summary', reportDate: '2024-01-31' },
    { name: 'Security Incident — Field Office Access', type: 'incident', status: 'pending_approval', description: 'Minor security incident at regional field office', incidentSeverity: 'medium', incidentLocation: 'Bahir Dar Field Office', actionsTaken: 'Incident logged, local authorities notified, staff debriefed.', reportDate: '2024-05-10' },
  ];

  for (const r of reports) {
    await prisma.report.create({
      data: {
        ...r,
        reportDate: new Date(r.reportDate),
        submittedById: users[0].id,
        submittedAt: r.status !== 'draft' ? new Date(r.reportDate) : null,
        approvedAt: r.status === 'approved' ? new Date(r.reportDate) : null,
        approvedById: r.status === 'approved' ? users[0].id : null,
      },
    });
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

  const seedMessages = [
    { content: 'Quarterly report draft is ready for review.', senderId: grace.id },
    { content: 'Field visit to Kaimu confirmed for May 5.', senderId: james.id },
    { content: 'Donor meeting scheduled — please review budget numbers.', senderId: jane.id },
  ];
  for (const m of seedMessages) {
    await prisma.message.create({ data: m });
  }

  const logisticsShipments = [
    { reference: 'SHP-240501', origin: 'Addis Ababa HQ', destination: 'Bahir Dar Field Office', carrier: 'ENA Transport', status: 'in_transit', priority: 'high', items: 'Medical kits', quantity: 50, expectedDate: new Date('2024-06-15'), createdById: admin.id },
    { reference: 'SHP-240502', origin: 'Dire Dawa Warehouse', destination: 'Harar Community Center', carrier: 'FastFreight ET', status: 'pending', priority: 'normal', items: 'School supplies', quantity: 120, expectedDate: new Date('2024-06-20'), createdById: admin.id },
    { reference: 'SHP-240503', origin: 'Addis Ababa HQ', destination: 'Hawassa Regional Office', carrier: 'ENA Transport', status: 'delivered', priority: 'normal', items: 'Laptops & tablets', quantity: 15, expectedDate: new Date('2024-05-28'), deliveredDate: new Date('2024-05-27'), createdById: admin.id },
  ];
  for (const s of logisticsShipments) {
    await prisma.logisticsShipment.create({ data: s });
  }

  const auditNow = Date.now();
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'organization.update', resource: 'organization', details: JSON.stringify({ field: 'landingTitle' }), ipAddress: '192.168.1.10', createdAt: new Date(auditNow - 86400000 * 2) },
      { userId: admin.id, action: 'user.create', resource: 'user', details: JSON.stringify({ email: 'james.k@engagenow.org' }), ipAddress: '192.168.1.10', createdAt: new Date(auditNow - 86400000) },
      { userId: jane.id, action: 'user.update', resource: 'user', details: JSON.stringify({ role: 'project_manager' }), ipAddress: '10.0.0.42', createdAt: new Date(auditNow - 43200000) },
      { userId: admin.id, action: 'profile.update', resource: 'profile', details: JSON.stringify({ fields: ['phone', 'bio'] }), ipAddress: '192.168.1.10', createdAt: new Date(auditNow - 3600000) },
      { userId: grace.id, action: 'logistics.create', resource: 'logistics', details: JSON.stringify({ reference: 'SHP-240501' }), ipAddress: '10.0.0.18', createdAt: new Date(auditNow - 1800000) },
      { userId: admin.id, action: 'user.login', resource: 'auth', details: JSON.stringify({ method: 'password' }), ipAddress: '192.168.1.10', createdAt: new Date(auditNow - 600000) },
    ],
  });

  console.log('Seed completed successfully!');
  console.log('Login credentials: ayalkbet@bamah.com / 123456789');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
