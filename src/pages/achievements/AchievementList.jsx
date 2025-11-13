import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { achievementService } from '../../services/achievementService';

const AchievementList = () => {
  const user = useSelector(state => state.auth.user);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'student') {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      const data = await achievementService.getStudentAchievements(user.id);
      setAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-black">Loading achievements...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">My Achievements</h1>
        <p className="text-gray-600">Badges and achievements you've earned</p>
      </div>

      {achievements.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No achievements earned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
            >
              {achievement.achievementIcon && (
                <img
                  src={achievement.achievementIcon}
                  alt={achievement.achievementName}
                  className="w-16 h-16 mx-auto mb-4"
                />
              )}
              <h3 className="text-lg font-semibold text-black mb-2">{achievement.achievementName}</h3>
              <p className="text-sm text-gray-600 mb-4">{achievement.achievementDescription}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-gray-500">Earned:</span>
                <span className="text-xs text-black">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </span>
              </div>
              {achievement.achievementPoints > 0 && (
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium">
                    {achievement.achievementPoints} points
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementList;

