import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getContactMessage,
  getContactMessages,
  replyToContactMessage,
} from '../../services/contactService';
import { dateTime, shortDate } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/apiError';
import { Message } from '../shared';

const statusFor = (message) => (message?.reply || message?.status === 'Replied' ? 'Replied' : 'Pending');

const statusClass = (status) =>
  status === 'Replied'
    ? 'bg-brand-status-success-soft text-brand-status-success'
    : 'bg-brand-status-warning-soft text-brand-status-warning';

const notifyAdminNotificationsChanged = () => {
  window.dispatchEvent(new Event('admin-notifications-changed'));
};

const TableSkeleton = () => (
  <div className="mt-7 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-sm" aria-label="Loading contact messages">
    {[1, 2, 3, 4].map((item) => (
      <div key={item} className="flex animate-pulse flex-col gap-3 border-b border-brand-border py-4 last:border-0 md:grid md:grid-cols-6">
        <div className="h-4 rounded bg-brand-border md:col-span-1" />
        <div className="h-4 rounded bg-brand-border md:col-span-1" />
        <div className="h-4 rounded bg-brand-border md:col-span-2" />
        <div className="h-4 rounded bg-brand-border" />
        <div className="h-4 rounded bg-brand-border" />
      </div>
    ))}
  </div>
);

export default function ContactMessages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState(false);

  const selectedId = id || selectedMessage?._id || messages[0]?._id;

  useEffect(() => {
    getContactMessages()
      .then(({ data }) => {
        setMessages(data?.messages || []);
        setError('');
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load contact messages.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return undefined;
    }

    let cancelled = false;
    getContactMessage(selectedId)
      .then(({ data }) => {
        if (cancelled) return;
        const message = data?.message || null;
        setSelectedMessage(message);
        setReply(message?.reply || '');
        setEditing(!message?.reply);
        if (message) {
          setMessages((currentMessages) => currentMessages.map((currentMessage) => (
            currentMessage._id === message._id ? message : currentMessage
          )));
        }
        notifyAdminNotificationsChanged();
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Could not open this contact message.'));
        }
      })
      .finally(() => {
        if (!cancelled) setMessageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const filteredMessages = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return messages.filter((message) => {
      const status = statusFor(message);
      const matchesStatus = statusFilter === 'All' || status === statusFilter;
      const matchesSearch = !searchText
        || [message.name, message.email, message.subject, message.message]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchText));

      return matchesStatus && matchesSearch;
    });
  }, [messages, search, statusFilter]);

  const selectMessage = (message) => {
    setMessageLoading(true);
    setSelectedMessage(message);
    navigate(`/admin/contact/${message._id}`, { replace: true });
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!selectedMessage || !reply.trim()) return;

    setSending(true);
    setSuccess('');
    setError('');

    try {
      const { data } = await replyToContactMessage(selectedMessage._id, reply.trim());
      setSelectedMessage(data.message);
      setReply(data.message.reply || '');
      setEditing(false);
      setMessages((currentMessages) => currentMessages.map((message) => (
        message._id === data.message._id ? data.message : message
      )));
      notifyAdminNotificationsChanged();
      setSuccess('Reply sent successfully.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to send this reply.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black">Contact messages</h1>
          <p className="mt-2 text-brand-muted">
            Search customer messages, review the conversation, and send support replies.
          </p>
        </div>
      </div>
      <Message error={error} success={success} />

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <div className="mt-7 grid gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-sm md:grid-cols-[1fr_auto]">
            <label className="block text-sm font-bold text-brand-text">
              Search messages
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
                placeholder="Search by name, email, subject, or message"
                type="search"
              />
            </label>
            <label className="block text-sm font-bold text-brand-text">
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15 md:w-44"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Replied</option>
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
            <section className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-sm">
              {filteredMessages.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <caption className="sr-only">Customer contact messages</caption>
                    <thead className="bg-brand-secondary-soft text-xs font-black uppercase tracking-widest text-brand-secondary-dark">
                      <tr>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Subject</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.map((message) => {
                        const status = statusFor(message);
                        const isSelected = message._id === selectedMessage?._id;

                        return (
                          <tr
                            key={message._id}
                            className={`border-t border-brand-border ${isSelected ? 'bg-brand-primary-soft' : ''}`}
                          >
                            <td className="p-4 font-bold text-brand-text">{message.name}</td>
                            <td className="p-4 text-brand-muted">{message.email}</td>
                            <td className="max-w-xs truncate p-4 font-bold text-brand-text">
                              {message.subject || 'Support message'}
                            </td>
                            <td className="p-4 text-brand-muted">{shortDate(message.createdAt)}</td>
                            <td className="p-4">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusClass(status)}`}>
                                {status}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => selectMessage(message)}
                                className="rounded-xl border border-brand-border px-4 py-2 text-sm font-black text-brand-text transition hover:bg-brand-secondary-soft"
                              >
                                Open
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-2xl font-black text-brand-text">No matching messages.</p>
                  <p className="mt-2 text-brand-muted">Try another search term or status filter.</p>
                </div>
              )}
            </section>

            <section className="min-w-0 rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
              {messageLoading ? (
                <div className="animate-pulse space-y-4" aria-label="Loading conversation">
                  <div className="h-5 w-1/2 rounded bg-brand-border" />
                  <div className="h-4 w-3/4 rounded bg-brand-border" />
                  <div className="h-28 rounded-2xl bg-brand-secondary-soft" />
                  <div className="h-36 rounded-2xl bg-brand-border" />
                </div>
              ) : selectedMessage ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-brand-muted">
                        Received {dateTime(selectedMessage.createdAt)}
                      </p>
                      <h2 className="mt-2 text-2xl font-black">{selectedMessage.name}</h2>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="mt-1 inline-block font-bold text-brand-link hover:underline"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-black ${statusClass(statusFor(selectedMessage))}`}>
                      {statusFor(selectedMessage)}
                    </span>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-black uppercase tracking-widest text-brand-muted">
                      {selectedMessage.subject || 'Support message'}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-brand-secondary-soft p-5 leading-7 text-brand-text">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div className="mt-6 rounded-2xl bg-brand-primary-soft p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-brand-text">Reply history</h3>
                      {selectedMessage.reply && !editing && (
                        <button
                          type="button"
                          onClick={() => setEditing(true)}
                          className="rounded-xl border border-brand-border bg-brand-surface px-4 py-2 text-sm font-black text-brand-text transition hover:bg-white"
                        >
                          Edit Reply
                        </button>
                      )}
                    </div>
                    {selectedMessage.reply ? (
                      <div className="mt-3 rounded-2xl bg-brand-surface p-4">
                        <p className="whitespace-pre-wrap leading-7 text-brand-text">{selectedMessage.reply}</p>
                        <p className="mt-3 text-sm font-bold text-brand-muted">
                          Replied {dateTime(selectedMessage.repliedAt)}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-brand-body">No reply has been sent yet.</p>
                    )}
                  </div>

                  <form onSubmit={sendReply} className="mt-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-brand-text">
                        {selectedMessage.reply ? 'Edit admin reply' : 'Write admin reply'}
                      </h3>
                      {selectedMessage.reply && !editing && (
                        <button
                          type="button"
                          onClick={() => setEditing(true)}
                          className="rounded-xl border border-brand-border px-4 py-2 text-sm font-black text-brand-text transition hover:bg-brand-secondary-soft"
                        >
                          Edit Reply
                        </button>
                      )}
                    </div>
                    {(!selectedMessage.reply || editing) && (
                      <>
                      <label className="block text-sm font-bold text-brand-text">
                        <span className="sr-only">Admin reply</span>
                        <textarea
                          value={reply}
                          onChange={(event) => setReply(event.target.value)}
                          rows="7"
                          required
                          className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface p-4 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
                          placeholder="Write a helpful reply to the customer"
                        />
                      </label>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={sending}
                          className="rounded-xl bg-brand-primary px-5 py-3 font-black text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {sending ? 'Sending...' : 'Send Reply'}
                        </button>
                        {selectedMessage.reply && (
                          <button
                            type="button"
                            onClick={() => {
                              setReply(selectedMessage.reply || '');
                              setEditing(false);
                            }}
                            className="rounded-xl border border-brand-border px-5 py-3 font-black text-brand-text transition hover:bg-brand-secondary-soft"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      </>
                    )}
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-2xl font-black text-brand-text">No contact messages yet.</p>
                  <p className="mt-2 text-brand-muted">New customer messages will appear here.</p>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
