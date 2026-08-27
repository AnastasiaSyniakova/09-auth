'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { createNote } from '@/lib/api/clientApi';
import { useNoteStore } from '@/lib/store/noteStore';
import type { NewNote, NoteTag } from '@/types/note';
import css from './NoteForm.module.css';

const noteTags: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

const subscribeToHydration = (onStoreChange: () => void) => {
  const unsubscribeHydrationStart =
    useNoteStore.persist.onHydrate(onStoreChange);
  const unsubscribeHydrationEnd =
    useNoteStore.persist.onFinishHydration(onStoreChange);

  return () => {
    unsubscribeHydrationStart();
    unsubscribeHydrationEnd();
  };
};

const getHydrationSnapshot = () => useNoteStore.persist.hasHydrated();
const getServerHydrationSnapshot = () => false;

export default function NoteForm() {
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, setDraft, clearDraft } = useNoteStore();
  const createMutation = useMutation({ mutationFn: createNote });

  const formAction = async (formData: FormData) => {
    const note: NewNote = {
      title: String(formData.get('title') ?? '').trim(),
      content: String(formData.get('content') ?? '').trim(),
      tag: String(formData.get('tag') ?? 'Todo') as NoteTag,
    };

    try {
      await createMutation.mutateAsync(note);
      clearDraft();
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.push('/notes/filter/all');
    } catch {
      // The mutation error is displayed below the form.
    }
  };

  if (!hasHydrated) {
    return <p>Loading draft...</p>;
  }

  return (
    <form className={css.form} action={formAction}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={css.input}
          defaultValue={draft.title}
          minLength={3}
          maxLength={50}
          required
          onChange={(event) => setDraft({ title: event.target.value })}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          defaultValue={draft.content}
          maxLength={500}
          onChange={(event) => setDraft({ content: event.target.value })}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          defaultValue={draft.tag}
          onChange={(event) => setDraft({ tag: event.target.value as NoteTag })}
        >
          {noteTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={css.submitButton}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : 'Create note'}
        </button>
      </div>

      {createMutation.isError && (
        <p role="alert" className={css.error}>
          Unable to create the note. Please try again.
        </p>
      )}
    </form>
  );
}
