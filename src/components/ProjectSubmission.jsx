import React, { useState } from 'react';

const ProjectSubmission = ({ onSubmit }) => {
  const [file, setFile] = useState(null);

  const handleChange = e => setFile(e.target.files[0]);
  const handleSubmit = e => {
    e.preventDefault();
    if (file) onSubmit(file);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center p-4 bg-gray-100 rounded">
      <input type="file" onChange={handleChange} className="mb-4"/>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Project</button>
    </form>
  );
};

export default ProjectSubmission;
