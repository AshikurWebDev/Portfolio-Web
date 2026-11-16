import { useEffect, useState, type FormEvent } from 'react'
import { SkillLogo, skillIconKeys, skillIcons } from '../lib/skillIcons'
import type { Skill, SkillGroup } from '../content/skills'
import { ApiError } from './client'
import { useFeedback } from './Feedback'
import {
  useAdminSkills,
  useCreateSkill,
  useCreateSkillGroup,
  useDeleteSkill,
  useDeleteSkillGroup,
  useRenameSkillGroup,
  useReorderSkillGroups,
  useReorderSkills,
  useUpdateSkill,
} from './queries'
import type { SaveSkill } from './types'

/*
  Skills manager at /admin/skills. Each card on the site is a group; each skill has a name,
  a percentage (0-100), an optional small logo and an optional note. Cards and skills can be
  added, edited, reordered and deleted. Changes show on the home page at once.
*/

const errorText = (e: unknown) => (e instanceof ApiError ? (Object.values(e.fieldErrors())[0] ?? e.message) : 'Something went wrong. Is the API running?')

/** Swaps two neighbours in a list of ids and returns the new list, or null at the edges. */
function moved(ids: string[], index: number, delta: -1 | 1): string[] | null {
  const target = index + delta
  if (target < 0 || target >= ids.length) return null
  const next = [...ids]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export default function SkillsAdmin() {
  const { data: groups, isPending, error } = useAdminSkills()
  const createGroup = useCreateSkillGroup()
  const reorder = useReorderSkillGroups()
  const { toast } = useFeedback()
  const [name, setName] = useState('')
  const [problem, setProblem] = useState<string | null>(null)

  const total = groups?.reduce((n, g) => n + g.skills.length, 0) ?? 0

  const onAddGroup = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setProblem('Write a card title.')
    setProblem(null)
    createGroup.mutate(name.trim(), {
      onSuccess: () => {
        toast('success', `Card "${name.trim()}" added.`)
        setName('')
      },
      onError: (err) => setProblem(errorText(err)),
    })
  }

  const move = (index: number, delta: -1 | 1) => {
    const ids = groups && moved(groups.map((g) => g.id), index, delta)
    if (ids) reorder.mutate(ids, { onError: (err) => toast('danger', errorText(err)) })
  }

  return (
    <section aria-labelledby="skills-title">
      <div className="adm-head">
        <h1 id="skills-title" className="adm-h1">
          Skills
        </h1>
        {groups ? (
          <p className="adm-muted adm-num">
            {total} skills · {groups.length} cards
          </p>
        ) : null}
      </div>
      <p className="adm-lede">Each card is a box in the Skills section. Set each skill’s percentage and pick a small logo so recruiters can scan the list quickly.</p>

      {error ? <p className="adm-error">Could not load skills: {error.message}</p> : null}
      {isPending ? <p className="adm-muted">Loading…</p> : null}

      <ol className="adm-skillgroups">
        {groups?.map((g, i) => (
          <SkillGroupCard key={g.id} group={g} groups={groups} index={i} total={groups.length} onMove={move} />
        ))}
      </ol>

      <form className="adm-addgroup" onSubmit={onAddGroup}>
        <label className="adm-field">
          <span>New card</span>
          <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cloud and DevOps" />
        </label>
        <button type="submit" className="adm-btn adm-btn--primary" disabled={createGroup.isPending}>
          Add card
        </button>
        {problem ? (
          <p className="adm-error" role="alert">
            {problem}
          </p>
        ) : null}
      </form>
    </section>
  )
}

function SkillGroupCard({ group, groups, index, total, onMove }: { group: SkillGroup; groups: SkillGroup[]; index: number; total: number; onMove: (i: number, d: -1 | 1) => void }) {
  const rename = useRenameSkillGroup()
  const remove = useDeleteSkillGroup()
  const reorderSkills = useReorderSkills()
  const { confirm, toast } = useFeedback()
  const [name, setName] = useState(group.name)
  const [problem, setProblem] = useState<string | null>(null)

  useEffect(() => setName(group.name), [group.name])

  const onRename = () =>
    rename.mutate(
      { id: group.id, name: name.trim() },
      { onSuccess: () => toast('success', 'Card renamed.'), onError: (e) => setProblem(errorText(e)) },
    )

  const onDelete = async () => {
    const count = group.skills.length
    const ok = await confirm({
      title: 'Delete this card?',
      message: `"${group.name}"${count ? ` and its ${count} ${count === 1 ? 'skill' : 'skills'}` : ''} will be removed from the site. This cannot be undone.`,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    remove.mutate(group.id, { onSuccess: () => toast('danger', `Deleted "${group.name}".`), onError: (e) => setProblem(errorText(e)) })
  }

  const moveSkill = (i: number, delta: -1 | 1) => {
    const ids = moved(group.skills.map((s) => s.id), i, delta)
    if (ids) reorderSkills.mutate({ groupId: group.id, ids }, { onError: (e) => setProblem(errorText(e)) })
  }

  const dirty = name.trim() !== group.name && name.trim().length > 0

  return (
    <li className="adm-skillgroup">
      <div className="adm-skillgroup__head">
        <label className="adm-field adm-skillgroup__name">
          <span className="sr-only">Card title</span>
          <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && dirty && onRename()} />
        </label>
        <div className="adm-design__actions">
          {dirty ? (
            <button type="button" className="adm-btn adm-btn--small adm-btn--primary" disabled={rename.isPending} onClick={onRename}>
              Rename
            </button>
          ) : null}
          <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" disabled={index === 0} onClick={() => onMove(index, -1)} aria-label={`Move card "${group.name}" up`}>
            ↑
          </button>
          <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" disabled={index === total - 1} onClick={() => onMove(index, 1)} aria-label={`Move card "${group.name}" down`}>
            ↓
          </button>
          <button type="button" className="adm-btn adm-btn--small adm-btn--danger" disabled={remove.isPending} onClick={onDelete}>
            Delete card
          </button>
        </div>
      </div>
      {problem ? (
        <p className="adm-error" role="alert">
          {problem}
        </p>
      ) : null}

      {group.skills.length === 0 ? <p className="adm-muted">No skills in this card yet. Add the first one below.</p> : null}
      <ol className="adm-skills">
        {group.skills.map((s, i) => (
          <SkillRow key={s.id} skill={s} groupId={group.id} groups={groups} index={i} total={group.skills.length} onMove={moveSkill} />
        ))}
      </ol>

      <NewSkill groupId={group.id} />
    </li>
  )
}

/** Logo dropdown with a live preview of the chosen logo. */
function IconPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="adm-field adm-iconpick">
      <span>{label}</span>
      <span className="adm-iconpick__row">
        <span className="adm-iconpick__preview" aria-hidden="true">
          <SkillLogo icon={value} size={20} />
        </span>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">No logo</option>
          {skillIconKeys.map((k) => (
            <option key={k} value={k}>
              {skillIcons[k].label}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}

/** Percentage as a slider plus a number box, kept in step. */
function LevelInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.max(0, Math.min(100, Math.round(Number.isFinite(v) ? v : 0))))
  return (
    <label className="adm-field adm-level">
      <span>Level</span>
      <span className="adm-level__row">
        <input type="range" min={0} max={100} step={5} value={value} onChange={(e) => set(e.target.valueAsNumber)} aria-label="Level in percent" />
        <span className="adm-level__num">
          <input type="number" min={0} max={100} value={value} onChange={(e) => set(e.target.valueAsNumber)} aria-label="Level in percent, number" />%
        </span>
      </span>
    </label>
  )
}

function SkillRow({ skill, groupId, groups, index, total, onMove }: { skill: Skill; groupId: string; groups: SkillGroup[]; index: number; total: number; onMove: (i: number, d: -1 | 1) => void }) {
  const update = useUpdateSkill()
  const remove = useDeleteSkill()
  const { confirm, toast } = useFeedback()
  const [form, setForm] = useState({ name: skill.name, level: skill.level, icon: skill.icon ?? '', note: skill.note ?? '', groupId })
  const [problem, setProblem] = useState<string | null>(null)

  // Keep the form in step after a save or refetch.
  useEffect(() => {
    setForm({ name: skill.name, level: skill.level, icon: skill.icon ?? '', note: skill.note ?? '', groupId })
  }, [skill.name, skill.level, skill.icon, skill.note, groupId])

  const dirty =
    form.name.trim() !== skill.name || form.level !== skill.level || form.icon !== (skill.icon ?? '') || form.note.trim() !== (skill.note ?? '') || form.groupId !== groupId

  const onSave = () => {
    const body: SaveSkill = { name: form.name.trim(), level: form.level, icon: form.icon || null, note: form.note.trim() || null, groupId: form.groupId }
    update.mutate(
      { id: skill.id, body },
      {
        onSuccess: () => toast('success', form.groupId !== groupId ? `Moved "${body.name}" to another card.` : `Saved "${body.name}".`),
        onError: (e) => setProblem(errorText(e)),
      },
    )
  }

  const onDelete = async () => {
    const ok = await confirm({ title: 'Delete this skill?', message: `"${skill.name}" will be removed from the site. This cannot be undone.`, confirmLabel: 'Delete' })
    if (!ok) return
    remove.mutate(skill.id, { onSuccess: () => toast('danger', `Deleted "${skill.name}".`), onError: (e) => setProblem(errorText(e)) })
  }

  const busy = update.isPending || remove.isPending

  return (
    <li className="adm-skill" aria-busy={busy}>
      <div className="adm-skill__fields">
        <IconPicker label="Logo" value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
        <label className="adm-field">
          <span>Skill</span>
          <input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <LevelInput value={form.level} onChange={(level) => setForm({ ...form, level })} />
        <label className="adm-field">
          <span>Note (optional)</span>
          <input value={form.note} maxLength={60} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. normal knowledge" />
        </label>
        <label className="adm-field">
          <span>Card</span>
          <select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })}>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="adm-design__actions">
        <button type="button" className="adm-btn adm-btn--small adm-btn--primary" disabled={!dirty || busy || !form.name.trim()} onClick={onSave}>
          {update.isPending ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" disabled={index === 0 || busy} onClick={() => onMove(index, -1)} aria-label={`Move "${skill.name}" up`}>
          ↑
        </button>
        <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" disabled={index === total - 1 || busy} onClick={() => onMove(index, 1)} aria-label={`Move "${skill.name}" down`}>
          ↓
        </button>
        <button type="button" className="adm-btn adm-btn--small adm-btn--danger" disabled={busy} onClick={onDelete}>
          Delete
        </button>
      </div>
      {problem ? (
        <p className="adm-error" role="alert">
          {problem}
        </p>
      ) : null}
    </li>
  )
}

function NewSkill({ groupId }: { groupId: string }) {
  const create = useCreateSkill()
  const { toast } = useFeedback()
  const [form, setForm] = useState({ name: '', level: 70, icon: '', note: '' })
  const [problem, setProblem] = useState<string | null>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setProblem('Write the skill name.')
    setProblem(null)
    const body: SaveSkill = { name: form.name.trim(), level: form.level, icon: form.icon || null, note: form.note.trim() || null }
    create.mutate(
      { groupId, body },
      {
        onSuccess: () => {
          toast('success', `Added "${body.name}".`)
          setForm({ name: '', level: 70, icon: '', note: '' })
        },
        onError: (err) => setProblem(errorText(err)),
      },
    )
  }

  return (
    <form className="adm-newskill" onSubmit={onSubmit}>
      <div className="adm-skill__fields">
        <IconPicker label="Logo" value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
        <label className="adm-field">
          <span>New skill</span>
          <input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Docker" />
        </label>
        <LevelInput value={form.level} onChange={(level) => setForm({ ...form, level })} />
        <label className="adm-field">
          <span>Note (optional)</span>
          <input value={form.note} maxLength={60} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
      </div>
      <button type="submit" className="adm-btn adm-btn--small adm-btn--primary" disabled={create.isPending}>
        Add skill
      </button>
      {problem ? (
        <p className="adm-error" role="alert">
          {problem}
        </p>
      ) : null}
    </form>
  )
}
