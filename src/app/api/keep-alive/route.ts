import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Requête ultra-légère pour "ping" la base de données
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase keep-alive ping successful.',
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}