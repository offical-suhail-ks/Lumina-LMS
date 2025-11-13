import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { videoService } from '../../services/videoService';
import { listCourses } from '../../services/courseService';

const VideoLibrary = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const coursesData = await listCourses();
      setCourses(coursesData);
      
      // Load videos for all courses
      const allVideos = [];
      for (const course of coursesData) {
        try {
          const courseVideos = await videoService.getVideosByCourse(course.id);
          allVideos.push(...courseVideos.map(v => ({ ...v, courseName: course.title })));
        } catch (error) {
          console.error(`Error loading videos for course ${course.id}:`, error);
        }
      }
      setVideos(allVideos);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-black">Loading videos...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Video Library</h1>
          <p className="text-gray-600">Course videos and lectures</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <button
            onClick={() => navigate('/videos/upload')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + Upload Video
          </button>
        )}
      </div>

      {videos.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No videos available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {videos.map(video => (
            <div
              key={video.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-black mb-1">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{video.courseName}</p>
              <p className="text-xs text-gray-500 mb-4">{video.description}</p>
              {video.videoUrl && (
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Watch Video
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;

