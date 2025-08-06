'use client';

import { observer } from '@legendapp/state/react';
import { ActionIcon } from '@mantine/core';
import { IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import { useRef, useState } from 'react';

const Recorder = observer(() => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const handleClick = async () => {
    if (!recording) {
      try {
        // Higher quality constraints
        const constraints: MediaStreamConstraints = {
          video: {
            width: { ideal: 1920 }, // Standard HD width
            height: { ideal: 1080 }, // Standard HD height
            frameRate: { ideal: 30, max: 60 }, // Higher frame rate
          },
          audio: true // Include system audio if possible
        };

        // Request screen capture
        const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

        // Create a MediaRecorder instance with better settings
        const options: MediaRecorderOptions | any = {
          mimeType: 'video/webm;codecs=h264', // Try for H.264 in WebM
          bitsPerSecond: 8000000, // 8 Mbps for better quality
          videoBitsPerSecond: 7500000, // Allocate most to video
          audioBitsPerSecond: 128000 // Standard audio bitrate
        };

        // Fallback to VP9 if H.264 isn't available
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/webm;codecs=vp9';
        }

        const recorder = new MediaRecorder(stream, options);

        // Collect recorded chunks
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        // Handle recording stop
        recorder.onstop = async () => {
          try {
            const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType });
            
            // Convert to MP4 if needed (using a library would be better)
            // For now we'll keep WebM but ensure it's high quality
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = `recording-${new Date().toISOString()}.${recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
            a.click();

            // Clean up
            window.URL.revokeObjectURL(url);
            recordedChunksRef.current = [];
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
          } catch (error) {
            console.error('Error saving recording:', error);
          }
        };

        // Start recording with 1-second chunks
        recorder.start(1000);
        setMediaRecorder(recorder);
        setRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
        setRecording(false);
      }
    } else {
      // Stop recording if MediaRecorder exists
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        mediaRecorder.stop();
      }
      setMediaRecorder(null);
      setRecording(false);
    }
  };

  return (
    <ActionIcon variant="transparent" color="gray" onClick={handleClick}>
      {recording ? (
        <IconPlayerStop size={'1.1rem'} stroke={1} />
      ) : (
        <IconPlayerPlay size={'1.1rem'} stroke={1} />
      )}
    </ActionIcon>
  );
});

export default Recorder;