import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { listAssignments } from '../../services/assignmentService';
import { listCourses } from '../../services/courseService';
import jsPDF from 'jspdf';

const AcademicTranscript = () => {
  const user = useSelector(state => state.auth.user);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsData, coursesData] = await Promise.all([
        listAssignments(),
        listCourses(),
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate course grades
  const getCourseGrades = () => {
    const courseGrades = {};
    
    courses.forEach(course => {
      const courseAssignments = assignments.filter(a => a.courseId === course.id);
      const gradedSubmissions = [];
      
      courseAssignments.forEach(assignment => {
        if (assignment.submissions) {
          const mySubmission = assignment.submissions.find(
            s => s.studentId === user?.id && s.grade !== null && s.grade !== undefined
          );
          if (mySubmission) {
            gradedSubmissions.push(parseFloat(mySubmission.grade));
          }
        }
      });
      
      if (gradedSubmissions.length > 0) {
        const average = (gradedSubmissions.reduce((sum, grade) => sum + grade, 0) / gradedSubmissions.length).toFixed(1);
        courseGrades[course.id] = {
          courseName: course.title,
          average,
          assignmentsCount: gradedSubmissions.length,
          grades: gradedSubmissions,
        };
      }
    });
    
    return courseGrades;
  };

  const courseGrades = getCourseGrades();
  const overallAverage = Object.values(courseGrades).length > 0
    ? (Object.values(courseGrades).reduce((sum, cg) => sum + parseFloat(cg.average), 0) / Object.values(courseGrades).length).toFixed(1)
    : 0;

  const downloadTranscript = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Academic Transcript', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Lumina Learning Management System', 105, 30, { align: 'center' });
    
    // Student Info
    doc.setFontSize(14);
    doc.text(`Student: ${user?.name || 'N/A'}`, 20, 45);
    doc.text(`Email: ${user?.email || 'N/A'}`, 20, 52);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 59);
    
    // Overall GPA
    doc.setFontSize(16);
    doc.text(`Overall Average: ${overallAverage}%`, 20, 75);
    
    // Course Grades Table
    let yPos = 90;
    doc.setFontSize(12);
    doc.text('Course Grades', 20, yPos);
    yPos += 10;
    
    Object.entries(courseGrades).forEach(([courseId, data]) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.text(data.courseName, 20, yPos);
      doc.text(`Average: ${data.average}%`, 120, yPos);
      doc.text(`Assignments: ${data.assignmentsCount}`, 160, yPos);
      yPos += 8;
    });
    
    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }
    
    doc.save(`transcript-${user?.name?.replace(/\s/g, '-') || 'student'}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading transcript...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Academic Transcript</h1>
            <p className="mt-2 text-sm text-slate-500">
              View your complete academic performance across all courses.
            </p>
          </div>
          <button
            onClick={downloadTranscript}
            className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Download PDF
          </button>
        </div>
      </header>

      {/* Overall Summary */}
      <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 shadow-lg shadow-indigo-500/20 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-white/80">Overall Average</p>
            <p className="text-4xl font-bold mt-2">{overallAverage}%</p>
          </div>
          <div>
            <p className="text-sm text-white/80">Courses Completed</p>
            <p className="text-4xl font-bold mt-2">{Object.keys(courseGrades).length}</p>
          </div>
          <div>
            <p className="text-sm text-white/80">Total Assignments</p>
            <p className="text-4xl font-bold mt-2">
              {Object.values(courseGrades).reduce((sum, cg) => sum + cg.assignmentsCount, 0)}
            </p>
          </div>
        </div>
      </section>

      {/* Course Grades */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Course Performance</h2>
        {Object.keys(courseGrades).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(courseGrades).map(([courseId, data]) => (
              <div
                key={courseId}
                className="rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-slate-900">{data.courseName}</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Average</p>
                      <p className={`text-2xl font-bold ${
                        parseFloat(data.average) >= 90 ? 'text-emerald-600' :
                        parseFloat(data.average) >= 80 ? 'text-blue-600' :
                        parseFloat(data.average) >= 70 ? 'text-amber-600' :
                        'text-rose-600'
                      }`}>
                        {data.average}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{data.assignmentsCount} assignment{data.assignmentsCount !== 1 ? 's' : ''} graded</span>
                </div>
                {/* Grade Distribution */}
                <div className="mt-3 flex items-center gap-1">
                  {data.grades.map((grade, idx) => (
                    <div
                      key={idx}
                      className={`h-8 flex-1 rounded ${
                        grade >= 90 ? 'bg-emerald-500' :
                        grade >= 80 ? 'bg-blue-500' :
                        grade >= 70 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                      title={`${grade}%`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No grades available yet.</p>
            <p className="text-sm text-slate-400 mt-2">
              Your transcript will be populated as you complete and receive grades for assignments.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AcademicTranscript;

