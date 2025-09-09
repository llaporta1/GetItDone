"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { api } from "~/trpc/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="mx-auto flex min-h-screen items-center justify-center p-6">
        <div className="opacity-70">Checking session…</div>
      </main>
    );
  }

  if (!session) return <SignedOutLanding />;

  return <TasksApp />;
}

function SignedOutLanding() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-semibold">Get It Done</h1>
      <p className="mt-2 text-center opacity-75">
        Welcome! Please sign in to continue.
      </p>

      <button
        onClick={() => signIn("github")}
        className="mt-6 w-full rounded-md border border-white/25 bg-white/10 px-4 py-2 transition hover:bg-white/15"
      >
        Sign in with GitHub
      </button>

      <p className="mt-3 text-xs opacity-60">
        By continuing you agree to our terms & privacy.
      </p>
    </main>
  );
}

function TasksApp() {
  const utils = api.useUtils();
  const { data: tasks, isLoading } = api.task.list.useQuery();

  const create = api.task.create.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });
  const toggle = api.task.toggle.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });
  const rename = api.task.rename.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });
  const remove = api.task.remove.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const remaining = tasks?.filter((t) => !t.done).length ?? 0;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Get It Done</h1>
        <button
          className="rounded border border-white/25 bg-white/10 px-3 py-2 text-white/90 transition hover:bg-white/15"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
      <p className="opacity-70">
            {remaining === 0
          ? "Phew—no tasks left!"
          : `${remaining} task${remaining === 1 ? "" : "s"} remaining`}
      </p>

      <form
        className="mt-4 relative rounded-2xl p-[1.5px] bg-[linear-gradient(135deg,rgba(255,255,255,0.35),rgba(255,255,255,0.08))] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = text.trim();
          if (!trimmed) return;
          create.mutate({ text: trimmed });
          setText("");
        }}
      >
        <div className="relative flex items-center gap-2 rounded-[1rem] border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-xl">
          <input
            className="flex-1 rounded-lg bg-transparent px-2 py-2 text-white placeholder-white/55 outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            placeholder="Jot it down…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={create.isPending}
          />
          <button
            type="submit"
            disabled={create.isPending || !text.trim()}
            className="rounded-xl border border-white/25
                       bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.10))]
                       px-4 py-2 text-sm font-medium text-white
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_24px_-12px_rgba(0,0,0,0.55)]
                       transition hover:bg-white/15 active:translate-y-px disabled:opacity-50"
          >
            {create.isPending ? "Adding…" : "Add"}
          </button>
        </div>
      </form>

      <section className="mt-6 space-y-2">
        {isLoading ? (
          <SkeletonRows />
        ) : !tasks || tasks.length === 0 ? (
          <div className="rounded-2xl border border-white/12 bg-white/10 p-6 text-center text-white/70 backdrop-blur-xl">
            Nothing here yet—add your first task!
          </div>
        ) : (
          tasks.map((t) => (
            <TaskRow
              key={t.id}
              id={t.id}
              text={t.text}
              done={t.done}
              editingId={editingId}
              editingText={editingText}
              setEditingId={setEditingId}
              setEditingText={setEditingText}
              onToggle={() => toggle.mutate({ id: t.id, done: !t.done })}
              onSave={() => {
                const trimmed = editingText.trim();
                if (!trimmed) return;
                rename.mutate({ id: t.id, text: trimmed });
                setEditingId(null);
                setEditingText("");
              }}
              onDelete={() => remove.mutate({ id: t.id })}
            />
          ))
        )}
      </section>
    </main>
  );
}

function TaskRow(props: {
  id: string;
  text: string;
  done: boolean;
  editingId: string | null;
  editingText: string;
  setEditingId: (v: string | null) => void;
  setEditingText: (v: string) => void;
  onToggle: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const {
    id,
    text,
    done,
    editingId,
    editingText,
    setEditingId,
    setEditingText,
    onToggle,
    onSave,
    onDelete,
  } = props;

  const isEditing = editingId === id;

  return (
    <div
      className="relative rounded-2xl p-[1.5px]
                 bg-[linear-gradient(135deg,rgba(255,255,255,0.35),rgba(255,255,255,0.08))]
                 transition-transform hover:scale-[1.002]"
    >
      <div
        className="group relative flex items-center gap-3 rounded-[1rem]
                   border border-white/12 bg-white/10 px-3 py-2 backdrop-blur-xl"
      >
      <div className="relative h-5 w-5">
        <input
          id={`chk-${id}`}
          type="checkbox"
          checked={done}
          onChange={onToggle}
          className="peer absolute inset-0 h-5 w-5 cursor-pointer appearance-none
                    rounded-md border border-white/30 bg-white/10
                    checked:bg-white checked:border-white
                    focus:outline-none focus:ring-2 focus:ring-white/25"
          aria-label={done ? "Mark incomplete" : "Mark complete"}
        />
        <span
          className={`pointer-events-none absolute inset-0 grid place-items-center
                      text-[13px] ${done ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-black">✓</span>
        </span>
      </div>
        {isEditing ? (
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onSave();
            }}
          >
            <input
              autoFocus
              className="flex-1 rounded-lg border border-white/20
                         bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))]
                         px-3 py-1 text-white outline-none focus:border-white/30"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditingId(null);
                  setEditingText("");
                }
              }}
            />
            <button className="rounded-lg border border-white/20 px-3 py-1 text-sm hover:bg-white/10">
              Save
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
              onClick={() => {
                setEditingId(null);
                setEditingText("");
              }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex w-full items-center justify-between gap-3">
            <span className={`truncate ${done ? "line-through text-white/50" : ""}`}>
              {text}
            </span>
            <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
              <button
                className="rounded-lg border border-white/20 px-2 py-1 text-sm hover:bg-white/10"
                onClick={() => {
                  setEditingId(id);
                  setEditingText(text);
                }}
              >
                Edit
              </button>
              <button
                className="rounded-lg border border-white/20 px-2 py-1 text-sm hover:bg-white/10"
                onClick={onDelete}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-2xl border border-white/12 bg-white/10"
        />
      ))}
    </div>
  );
}
