// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Mengalihkan secara instan ke halaman login admin saat website dibuka
  redirect('/admin/login');
}
