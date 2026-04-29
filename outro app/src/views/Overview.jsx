import React from 'react';
import Header from '../components/Header';
import RecruitmentPipeline from '../components/RecruitmentPipeline';
import CompliancePanel from '../components/CompliancePanel';
import DigitalAdmission from '../components/DigitalAdmission';
import OperationalReports from '../components/OperationalReports';
import ServiceProviderCard from '../components/ServiceProviderCard';

const Overview = () => {
  return (
    <>
      <Header />
      {/* Card estratégico de Prestação de Serviço */}
      <ServiceProviderCard />
      <div className="dashboard-grid">
        <div className="center-col">
          <RecruitmentPipeline />
          <div className="bottom-row">
            <OperationalReports />
          </div>
        </div>
        <div className="right-col">
          <CompliancePanel />
          <DigitalAdmission />
        </div>
      </div>
    </>
  );
};

export default Overview;
