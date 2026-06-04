'use client';

import { useState } from 'react';

export default function BeneficiariesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const beneficiaries = [
    { id: 1, name: 'Amina Hassan', email: 'amina.hassan@example.com', region: 'Nairobi', programs: 2, enrolled: '2023-03-15' },
    { id: 2, name: 'Bernard Okonkwo', email: 'bernard.o@example.com', region: 'Lagos', programs: 1, enrolled: '2023-07-22' },
    { id: 3, name: 'Cynthia Mwangi', email: 'cynthia.m@example.com', region: 'Nairobi', programs: 3, enrolled: '2023-01-10' },
    { id: 4, name: 'David Kipchoge', email: 'david.k@example.com', region: 'Eldoret', programs: 1, enrolled: '2024-02-05' },
    { id: 5, name: 'Ester Abebe', email: 'ester.a@example.com', region: 'Addis Ababa', programs: 2, enrolled: '2023-11-12' },
    { id: 6, name: 'Francis Mwale', email: 'francis.m@example.com', region: 'Dar es Salaam', programs: 1, enrolled: '2024-01-20' },
    { id: 7, name: 'Grace Kamau', email: 'grace.k@example.com', region: 'Nairobi', programs: 2, enrolled: '2023-05-30' },
    { id: 8, name: 'Henry Njoroge', email: 'henry.n@example.com', region: 'Lagos', programs: 3, enrolled: '2023-08-14' },
  ];

  const regions = ['Nairobi', 'Lagos', 'Eldoret', 'Addis Ababa', 'Dar es Salaam'];
  
  const filteredBeneficiaries = beneficiaries.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || b.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const stats = [
    { label: 'Total Beneficiaries', value: 4670, color: 'green' },
    { label: 'This Month', value: 125, color: 'amber' },
    { label: 'Active Programs', value: 12, color: 'blue' },
    { label: 'Completion Rate', value: '86%', color: 'green' },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Beneficiaries</h1>
        <p>Manage and track all beneficiaries across your programs.</p>
      </div>

      <div className="bene-stats">
        {stats.map((stat, idx) => (
          <div key={idx} className="bene-card">
            <div className="bene-num" style={{ color: stat.color === 'green' ? '#1a6b3c' : stat.color === 'amber' ? '#f59e0b' : '#3b82f6' }}>
              {stat.value}
            </div>
            <div className="bene-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="Search beneficiaries..."
          className="search-inline"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          className="filter-select"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="all">All Regions</option>
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      <div className="bene-table">
        <div className="bene-table-head">
          <span>Name</span>
          <span>Email</span>
          <span>Region</span>
          <span>Programs</span>
          <span>Enrolled</span>
        </div>
        {filteredBeneficiaries.map((beneficiary) => (
          <div key={beneficiary.id} className="bene-row">
            <div className="bene-name">{beneficiary.name}</div>
            <div className="bene-cell">{beneficiary.email}</div>
            <div className="bene-cell">{beneficiary.region}</div>
            <div className="bene-cell">{beneficiary.programs}</div>
            <div className="bene-cell">{new Date(beneficiary.enrolled).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </div>
        ))}
      </div>
    </>
  );
}
