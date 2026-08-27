'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchNoteById } from '@/lib/api/clientApi';
import Modal from '@/components/Modal/Modal';
import css from './NotePreview.module.css';

export default function NotePreviewClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    data: note,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
  });

  const closeModal = () => router.back();

  return (
    <Modal onClose={closeModal} ariaLabel="Note preview">
      {isLoading && <p>Loading, please wait...</p>}
      {(isError || !note) && !isLoading && <p>Something went wrong.</p>}

      {note && (
        <div className={css.container}>
          <div className={css.item}>
            <div className={css.header}>
              <h2>{note.title}</h2>
            </div>
            <p className={css.tag}>{note.tag}</p>
            <p className={css.content}>{note.content}</p>
            <p className={css.date}>
              Created {new Date(note.createdAt).toLocaleDateString()}
            </p>
            <button className={css.backBtn} type="button" onClick={closeModal}>
              Back
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
