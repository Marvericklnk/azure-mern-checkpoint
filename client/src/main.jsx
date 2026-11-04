import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

async function request(path = '', options = {}) {
  const response = await fetch('/api/tasks' + path, { ...options, headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong. Please try again.');
  }
  return response.status === 204 ? null : response.json();
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { setTasks(await request()); } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function change(action) {
    setBusy(true); setError('');
    try { await action(); } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  function add(event) {
    event.preventDefault();
    if (!title.trim()) return;
    change(async () => {
      const task = await request('', { method: 'POST', body: JSON.stringify({ title: title.trim() }) });
      setTasks(current => [task, ...current]); setTitle('');
    });
  }
  function update(task, changes) {
    return change(async () => {
      const updated = await request('/' + task._id, { method: 'PUT', body: JSON.stringify(changes) });
      setTasks(current => current.map(item => item._id === updated._id ? updated : item));
      setEditing(null);
    });
  }
  const done = tasks.filter(task => task.done).length;
  const visible = tasks.filter(task => filter === 'all' || (filter === 'done' ? task.done : !task.done));
  return <main>
    <header><a href="/" className="brand">daylist<span>✳</span></a><span className="tag">A little more organised.</span></header>
    <section className="intro"><p className="eyebrow">MAKE ROOM FOR WHAT MATTERS</p><h1>One thing<br/>at a time.</h1><p>A simple space for your tasks, your plans, and your next small win.</p></section>
    <section className="board" aria-label="Task board">
      <div className="board-title"><h2>Your task board</h2><span>{done} of {tasks.length} complete</span></div>
      <form className="add" onSubmit={add}><label className="sr-only" htmlFor="title">New task</label><input id="title" value={title} maxLength={150} onChange={e => setTitle(e.target.value)} placeholder="What would you like to get done?" required/><button disabled={busy || loading || !title.trim()}>Add task +</button></form>
      <div className="filters">{['all', 'active', 'done'].map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'all' ? 'All tasks' : value === 'active' ? 'To do' : 'Completed'}</button>)}</div>
      {error && <div role="alert" className="error">{error} <button disabled={busy || loading} onClick={load}>Retry</button></div>}
      {loading ? <p role="status">Loading your tasks…</p> : <ul>{visible.map(task => <li key={task._id}>
        <input aria-label={'Mark ' + task.title + (task.done ? ' incomplete' : ' complete')} type="checkbox" checked={task.done} disabled={busy} onChange={() => update(task, { done: !task.done })}/>
        {editing === task._id ? <form className="edit" onSubmit={e => { e.preventDefault(); if (draft.trim()) update(task, { title: draft.trim() }); }}><input aria-label="Edit task title" autoFocus maxLength={150} required value={draft} onChange={e => setDraft(e.target.value)}/><button disabled={busy || !draft.trim()}>Save</button><button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button></form> : <><span className={task.done ? 'done title' : 'title'}>{task.title}</span><button className="text" disabled={busy} onClick={() => { setEditing(task._id); setDraft(task.title); }}>Edit</button><button className="text" disabled={busy} aria-label={'Delete ' + task.title} onClick={() => change(async () => { await request('/' + task._id, { method: 'DELETE' }); setTasks(current => current.filter(item => item._id !== task._id)); })}>Delete</button></>}
      </li>)}</ul>}
      {!loading && !error && !visible.length && <div className="empty"><strong>{tasks.length ? 'Nothing in this view.' : 'A fresh start.'}</strong><p>{tasks.length ? 'Try another filter to see your tasks.' : 'Add your first task above. Small steps count.'}</p></div>}
    </section><footer>Built with React, Express & MongoDB.<span>GoMyCode · MERN on Azure</span></footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
