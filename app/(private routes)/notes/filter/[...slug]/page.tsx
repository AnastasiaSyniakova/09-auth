import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api/serverApi';
import type { NoteTag } from '@/types/note';
import NotesClient from './Notes.client';

const INITIAL_PAGE = 1;
const NOTES_PER_PAGE = 12;
const INITIAL_SEARCH = '';
const tags: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

type NotesFilter = NoteTag | 'all';

interface NotesProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({
  params,
}: NotesProps): Promise<Metadata> {
  const { slug } = await params;
  const filter = slug[0] ?? 'all';
  const filterLabel = filter === 'all' ? 'All notes' : `${filter} notes`;
  const description = `Browse and manage notes in the ${filter} filter.`;

  return {
    title: filterLabel,
    description,
    openGraph: {
      title: `${filterLabel} | NoteHub`,
      description,
      url: `https://notehub.com/notes/filter/${encodeURIComponent(filter)}`,
      images: [
        {
          url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
          width: 1200,
          height: 630,
          alt: `${filterLabel} in NoteHub`,
        },
      ],
    },
  };
}

function isNotesFilter(value: string): value is NotesFilter {
  return value === 'all' || tags.includes(value as NoteTag);
}

export default async function Notes({ params }: NotesProps) {
  const { slug } = await params;
  const tag = slug[0];

  if (slug.length !== 1 || !isNotesFilter(tag)) {
    notFound();
  }

  const queryClient = new QueryClient();
  const apiTag = tag === 'all' ? undefined : tag;

  await queryClient.prefetchQuery({
    queryKey: ['notes', INITIAL_PAGE, INITIAL_SEARCH, tag],
    queryFn: () =>
      fetchNotes({
        page: INITIAL_PAGE,
        perPage: NOTES_PER_PAGE,
        tag: apiTag,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient key={tag} tag={tag} />
    </HydrationBoundary>
  );
}
