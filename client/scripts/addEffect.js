import fs from 'fs';

let content = fs.readFileSync('src/pages/staff/frontdesk/FrontDeskDashboard.jsx', 'utf8');

if (!content.includes("if (activeTab === 'payments')")) {
  content = content.replace(
    'const fetchMembershipPlans = async () => {',
    `useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab]);

  const fetchMembershipPlans = async () => {`
  );
  fs.writeFileSync('src/pages/staff/frontdesk/FrontDeskDashboard.jsx', content, 'utf8');
  console.log('Inserted activeTab payments useEffect!');
} else {
  console.log('Already present.');
}
