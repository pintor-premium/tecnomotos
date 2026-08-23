import { NextResponse } from 'next/server';
import { bootstrapOwner } from '@/lib/auth/bootstrap';

export async function POST() {
  try {
    const result = await bootstrapOwner();
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Erro interno durante o bootstrap.';
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
