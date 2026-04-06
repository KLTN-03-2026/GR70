// src/pages/kitchen/reports/RevenueReport.jsx
import React, { useState } from 'react';
import ReportExport from '../ReportExport';

const RevenueReport = () => {
    return <ReportExport initialReportType="revenue" />;
};

export default RevenueReport;