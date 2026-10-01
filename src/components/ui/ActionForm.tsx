'use client';

import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import type { ActionState } from '@/app/actions';

const PendingContext = createContext(false);

type ActionFormProps = {
  /** Server Action à exécuter. */
  action: (formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  /** Réinitialise le formulaire après un succès. */
  resetOnSuccess?: boolean;
  /** Appelé après un succès (ex. fermeture d'une modale). */
  onSuccess?: (state: ActionState) => void;
};

/**
 * Formulaire client branché sur une Server Action.
 * Gère l'état d'attente, l'affichage du message de succès/erreur
 * et la propagation des erreurs de redirection de Next.js.
 */
export function ActionForm({
  action,
  children,
  className = 'space-y-4',
  resetOnSuccess = false,
  onSuccess,
}: ActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ActionState | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    try {
      const result = await action(formData);
      // `redirect()` (connexion, inscription, déconnexion) ne renvoie aucune
      // valeur : Next.js interrompt l'action pour naviguer. Rien à afficher.
      if (!result) return;
      setState(result);
      if (result.ok) {
        if (resetOnSuccess) form.reset();
        onSuccess?.(result);
      }
    } finally {
      // En cas de redirect(), Next.js lève une erreur interne qui doit se propager.
      setPending(false);
    }
  }

  return (
    <PendingContext.Provider value={pending}>
      <form ref={formRef} onSubmit={handleSubmit} className={className} noValidate>
        {state?.error && (
          <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
            {state.error}
          </div>
        )}
        {state?.ok && state.message && (
          <div role="status" className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
            {state.message}
          </div>
        )}
        {children}
      </form>
    </PendingContext.Provider>
  );
}

/** Bouton de soumission : désactivé et libellé « en cours » pendant l'appel. */
export function SubmitButton({
  children,
  className = 'btn btn-primary',
  pendingLabel = 'Traitement…',
  title,
}: {
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
  title?: string;
}) {
  const pending = useContext(PendingContext);
  return (
    <button type="submit" disabled={pending} title={title} className={className}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
