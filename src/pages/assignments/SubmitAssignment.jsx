import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { listAssignments, submitAssignment } from '../../services/assignmentService';

const SubmitAssignment = () => {
  const user = useSelector(state => state.auth.user);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect admin and faculty away from submit page
  if (user?.role === 'admin' || user?.role === 'faculty') {
    return <Navigate to="/assignments" replace />;
  }

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const assignmentData = await listAssignments();
        setAssignments(assignmentData);
      } catch (error) {
        console.error(error);
        setStatus({ type: 'error', message: 'Unable to load assignments.' });
      }
    };

    fetchAssignments();
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    if (!selectedAssignmentId) {
      setStatus({ type: 'error', message: 'Please select an assignment.' });
      return;
    }

    if (!user?.id) {
      setStatus({ type: 'error', message: 'User information not available. Please log in again.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      await submitAssignment(selectedAssignmentId, {
        file,
        studentId: user.id,
        notes,
      });
      setStatus({ type: 'success', message: 'Submission received successfully!' });
      setFile(null);
      setNotes('');
      setSelectedAssignmentId('');
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Unable to submit assignment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Submit assignment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Attach deliverables, capture context, and transmit project work to faculty.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur"
      >
        <label className="text-sm font-medium text-slate-600">
          Assignment
          <select
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            value={selectedAssignmentId}
            onChange={event => setSelectedAssignmentId(event.target.value)}
          >
            <option value="">Select assignment</option>
            {assignments.map(assignment => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
        </label>


        <label className="text-sm font-medium text-slate-600">
          Notes for reviewer (optional)
          <textarea
            rows={4}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            value={notes}
            onChange={event => setNotes(event.target.value)}
            placeholder="Share context, blockers, or artefact references..."
          />
        </label>

        <label className="text-sm font-medium text-slate-600">
          Upload artefact
          <input
            type="file"
            onChange={event => setFile(event.target.files?.[0] ?? null)}
            className="mt-2 w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-600 hover:border-indigo-300 focus:border-indigo-500"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Submitting...' : 'Submit assignment'}
        </button>

        {status.type ? (
          <p
            className={`rounded-xl px-4 py-3 text-xs font-medium ${
              status.type === 'success'
                ? 'border border-emerald-100 bg-emerald-50 text-emerald-500'
                : 'border border-red-100 bg-red-50 text-red-500'
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </form>
    </div>
  );
};

export default SubmitAssignment;
