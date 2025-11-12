import React from 'react';

const VideoCall = () => (
  <div className="flex flex-col items-center justify-center h-full bg-gray-200 rounded">
    <div className="mb-4">
      <span className="block text-lg">Video Call Section (WebRTC integration goes here)</span>
    </div>
    <button className="bg-green-500 text-white rounded px-4 py-2">Start Call</button>
  </div>
);

export default VideoCall;
