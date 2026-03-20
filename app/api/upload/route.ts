import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join, extname } from 'path';
import { AssemblyAI } from 'assemblyai';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { config } from '../../../lib/config'; // Import the centralized config

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

function extractAudio(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // In production, you'd likely store this in S3/AWS instead of public dir
  const originalPath = join(process.cwd(), 'public', file.name);
  await writeFile(originalPath, buffer);

  let finalPathToTranscribe = originalPath;
  const isVideo = file.type.startsWith('video/') || ['.mp4', '.mov', '.mkv', '.avi'].includes(extname(file.name).toLowerCase());

  if (isVideo) {
    console.log(`Extracting audio from video: ${file.name}`);
    const audioOutputPath = join(process.cwd(), 'public', `${file.name}-audio.mp3`);
    try {
      await extractAudio(originalPath, audioOutputPath);
      finalPathToTranscribe = audioOutputPath;
      // We can optionally delete the original video if we only needed the audio
      // await unlink(originalPath).catch(console.error);
    } catch (err) {
      console.error("Audio extraction failed:", err);
      return NextResponse.json({ success: false, error: 'Failed to extract audio from video' }, { status: 500 });
    }
  }

  const apiKey = config.assemblyAiApiKey;
  console.log("ASSEMBLYAI_API_KEY in /api/upload (from config):", apiKey ? "***" + apiKey.slice(-4) : "undefined"); // Added logging
  
  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    // Return a mock transcript if no API key is provided so the UI can still be tested
    console.warn("No AssemblyAI API Key found. Returning mock transcript.");
    return NextResponse.json({ 
      success: true, 
      transcript: "This is a mock transcript because the AssemblyAI API key is missing. In a real scenario, this would be the transcribed text of the lecture you just uploaded. It covers various clinical concepts like hypertension, diabetes, and patient care protocols." 
    });
  }

  try {
  const client = new AssemblyAI({ apiKey });

  // Upload the local file → returns { upload_url: string, ... }
  const upload = await client.files.upload(finalPathToTranscribe);
  console.log("Uploaded to:", upload); // upload is already the URL string

  // Best: Use transcribe() — it accepts local path directly (SDK handles upload internally!)
  // OR pass the upload_url if you prefer separate steps
  const transcript = await client.transcripts.transcribe({
    audio: finalPathToTranscribe,  // ← local path string! SDK uploads it for you
    // audio: upload.upload_url,   // ← alternative if you want to keep separate upload
    speech_models: ["universal-3-pro", "universal-2"],
    language_detection: true,          // highly recommended
    // Add these for lecture/medical content (optional but useful):
    // speaker_labels: true,           // labels Speaker 1, Speaker 2, etc.
    // content_safety: true,           // detects sensitive topics if needed
    // sentiment_analysis: true,       // per-sentence sentiment
  });

  // Now transcript is COMPLETE (status === "completed")
  if (transcript.status === "error") {
    throw new Error(`Transcription error: ${transcript.error}`);
  }

  // Optional: Log which model was actually used
  console.log("Model used:", transcript.speech_model_used); // "universal-3-pro" or "universal-2"

  // Cleanup files (good practice to avoid disk buildup)
  await unlink(finalPathToTranscribe).catch(() => {});
  if (finalPathToTranscribe !== originalPath) {
    await unlink(originalPath).catch(() => {});
  }

  return NextResponse.json({ 
    success: true, 
    transcript: transcript.text,
    // optional extras:
    // words: transcript.words,     // word-level timestamps/confidence
    // utterances: transcript.utterances,  // if speaker_labels enabled
  });

} catch (error: any) {
  console.error("AssemblyAI Error:", error);
  const message = error?.message || error?.toString() || 'Failed to transcribe';
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
}
