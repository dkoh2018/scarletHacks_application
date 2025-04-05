import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      );
    }

    // Call the Python script and pass the text
    const { stdout, stderr } = await execPromise(
      `python photo_converter.py "${text.replace(/"/g, '\\"')}"`
    );

    if (stderr) {
      console.error('Python script error:', stderr);
      return NextResponse.json(
        { error: 'Error processing the conversion', details: stderr },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: stdout.trim() });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}
