'use client';

import { useState, type ReactNode } from 'react';
import { Modal } from './Modal';
import { ActionForm, SubmitButton } from './ActionForm';
import type { ActionState } from '@/app/actions';

/**
 * Bouton d'action ouvrant une modale de confirmation avant d'exécuter
 * une Server Action destructive.
 */
export function ConfirmAction({
  action,
  hidden,
  title,
  description,
  confirmLabel = 'Confirmer',
  trigger,
  triggerClassName = 'text-navy-400 hover:text-red-500 p-1.5 transition-colors',
  triggerTitle,
  danger = true,
}: {
  action: (formData: FormData) => Promise<ActionState>;
  /** Champs cachés transmis à l'action. */
  hidden: Record<string, string | null>;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  trigger: ReactNode;
  triggerClassName?: string;
  triggerTitle?: string;
  danger?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName} title={triggerTitle}>
        {trigger}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-5">
          <div className="text-sm text-navy-600">{description}</div>

          <ActionForm action={action} className="space-y-4" onSuccess={() => setOpen(false)}>
            {Object.entries(hidden).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value ?? ''} />
            ))}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
                Annuler
              </button>
              <SubmitButton className={danger ? 'btn btn-danger' : 'btn btn-primary'}>{confirmLabel}</SubmitButton>
            </div>
          </ActionForm>
        </div>
      </Modal>
    </>
  );
}
