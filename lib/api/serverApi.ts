import { cookies } from 'next/headers';
import type { AxiosResponse } from 'axios';
import { api } from './api';
import type { FetchNotesParams, FetchNotesResponse } from './clientApi';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';

interface SessionResponse {
  success: boolean;
}

async function getCookieHeader(cookieHeader?: string): Promise<string> {
  if (cookieHeader !== undefined) {
    return cookieHeader;
  }

  return (await cookies()).toString();
}

export async function fetchNotes(
  params: FetchNotesParams,
): Promise<FetchNotesResponse> {
  const { data } = await api.get<FetchNotesResponse>('/notes', {
    params,
    headers: { Cookie: await getCookieHeader() },
  });
  return data;
}

export async function fetchNoteById(noteId: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${noteId}`, {
    headers: { Cookie: await getCookieHeader() },
  });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me', {
    headers: { Cookie: await getCookieHeader() },
  });
  return data;
}

export async function checkSession(): Promise<AxiosResponse<SessionResponse>> {
  const response = await api.get<SessionResponse>('/auth/session', {
    headers: { Cookie: await getCookieHeader() },
  });
  return response;
}
