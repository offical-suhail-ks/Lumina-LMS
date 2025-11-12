import React from 'react';

const ParentProfile = () => (
  <div className="p-6 max-w-lg mx-auto">
    <h2 className="text-2xl font-bold mb-4">Parent Profile</h2>
    <div className="bg-white p-4 rounded shadow mb-4">
      <p>Name: John Smith</p>
      <p>Email: john@example.com</p>
      <p>Student: Alice Smith (Year: 2nd)</p>
      <p>Fee Paid: $800</p>
    </div>
  </div>
);

export default ParentProfile;
