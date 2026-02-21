// Format date to readable format
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Calculate days until date
export const daysUntilDate = (date) => {
  const today = new Date();
  const targetDate = new Date(date);
  const timeDiff = targetDate - today;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

// Check if license is valid
export const isLicenseValid = (expiryDate) => {
  return new Date(expiryDate) > new Date();
};

// Calculate age from birth date
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Get status color class
export const getStatusColor = (status) => {
  const colors = {
    available: 'bg-green-100 text-green-800',
    on_trip: 'bg-blue-100 text-blue-800',
    in_shop: 'bg-orange-100 text-orange-800',
    retired: 'bg-gray-100 text-gray-800',
    on_duty: 'bg-green-100 text-green-800',
    off_duty: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    draft: 'bg-yellow-100 text-yellow-800',
    dispatched: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Calculate vehicle ROI
export const calculateROI = (revenue, maintenance, fuel, acquisitionCost) => {
  if (acquisitionCost === 0) return 0;
  return (((revenue - (maintenance + fuel)) / acquisitionCost) * 100).toFixed(2);
};
