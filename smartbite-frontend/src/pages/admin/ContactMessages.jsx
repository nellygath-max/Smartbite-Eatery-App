import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  deleteContactMessage,
  getContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} from '../../services/contactService';
import { dateTime, shortDate } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/apiError';
import { Message } from '../shared';

const statusClass = (status) => {
  if (status === 'Resolved') return 'bg-brand-status-success-soft text-brand-status-success';
  if (status === 'Read') return 'bg-brand-status-info-soft text-brand-status-info';
  return 'bg-brand-status-warning-soft text-brand-status-warning';
};

const notifyAdminNotificationsChanged = () => {
  window.dispatchEvent(new Event('admin-notifications-changed'));
};

export default function ContactMessages() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const selectedId = id || messages[0]?._id;

  const loadMessages = () =>
    getContactMessages()
      .then(({ data }) => {
        setMessages(data?.messages || []);
        setError('');
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load contact messages.')))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    let cancelled = false;

    getContactMessage(selectedId)
      .then(async ({ data }) => {
        let message = data?.message || null;
        if (message?.status === 'Unread') {
          const statusResponse = await updateContactMessageStatus(message._id, 'Read');
          message = statusResponse.data?.message || message;
          notifyAdminNotificationsChanged();
        }

        if (cancelled) return;
        setSelectedMessage(message);
        if (message) {
          setMessages((currentMessages) => currentMessages.map((currentMessage) => (
            currentMessage._id === message._id ? message : currentMessage
          )));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Could not open this contact message.'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const currentMessage = useMemo(
    () => selectedMessage || messages.find((message) => message._id === selectedId) || null,
    [messages, selectedId, selectedMessage]
  );

  const setStatus = async (status) => {
    if (!currentMessage) return;
    setSuccess('');
    try {
      const { data } = await updateContactMessageStatus(currentMessage._id, status);
      setSelectedMessage(data.message);
      setMessages((currentMessages) => currentMessages.map((message) => (
        message._id === data.message._id ? data.message : message
      )));
      notifyAdminNotificationsChanged();
      setSuccess('Contact message status updated.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update message status.'));
    }
  };

  const removeMessage = async () => {
    if (!currentMessage) return;
    const shouldDelete = window.confirm('Delete this contact message?');
    if (!shouldDelete) return;

    try {
      await deleteContactMessage(currentMessage._id);
      setMessages((currentMessages) => currentMessages.filter((message) => message._id !== currentMessage._id));
      setSelectedMessage(null);
      notifyAdminNotificationsChanged();
      setSuccess('Contact message deleted.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete this message.'));
    }
  };

  return (
    <>
      <h1 className="text-3xl font-black">Contact messages</h1>
      <p className="mt-2 text-brand-muted">
        Read customer contact messages and keep their follow-up status current.
      </p>
      <Message error={error} success={success} />

      {loading ? (
        <p className="mt-7 rounded-2xl bg-brand-surface p-8 text-brand-muted">Loading contact messages...</p>
      ) : (
        <div className="mt-7 grid gap-5 lg:grid-cols-[22rem_1fr]">
          <aside className="space-y-3">
            {messages.map((message) => (
              <Link
                key={message._id}
                to={`/admin/contact/${message._id}`}
                className={`block rounded-2xl border p-4 text-left transition hover:bg-brand-secondary-soft ${
                  message._id === currentMessage?._id
                    ? 'border-brand-primary bg-brand-primary-soft'
                    : 'border-brand-border bg-brand-surface'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <b className="min-w-0 truncate text-brand-text">{message.name}</b>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${statusClass(message.status)}`}>
                    {message.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-brand-muted">{message.email}</p>
                {message.subject && (
                  <p className="mt-2 truncate text-sm font-bold text-brand-text">{message.subject}</p>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-brand-muted">{message.message}</p>
                <p className="mt-2 text-xs font-bold text-brand-secondary-dark">{shortDate(message.createdAt)}</p>
              </Link>
            ))}
            {!messages.length && (
              <p className="rounded-2xl bg-brand-surface p-8 text-brand-muted">
                No contact messages yet.
              </p>
            )}
          </aside>

          <section className="min-w-0 rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            {currentMessage ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-brand-muted">
                      {dateTime(currentMessage.createdAt)}
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{currentMessage.name}</h2>
                    {currentMessage.subject && (
                      <p className="mt-2 text-lg font-bold text-brand-secondary-dark">
                        {currentMessage.subject}
                      </p>
                    )}
                    <a
                      href={`mailto:${currentMessage.email}`}
                      className="mt-1 inline-block font-bold text-brand-link hover:underline"
                    >
                      {currentMessage.email}
                    </a>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-black ${statusClass(currentMessage.status)}`}>
                    {currentMessage.status}
                  </span>
                </div>
                <p className="mt-6 whitespace-pre-wrap rounded-2xl bg-brand-secondary-soft p-5 leading-7 text-brand-text">
                  {currentMessage.message}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {['Unread', 'Read', 'Resolved'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatus(status)}
                      className="rounded-xl border border-brand-border px-4 py-2 text-sm font-black text-brand-text transition hover:bg-brand-secondary-soft"
                    >
                      Mark {status}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={removeMessage}
                    className="rounded-xl bg-brand-status-danger px-4 py-2 text-sm font-black text-white transition hover:opacity-90"
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <p className="text-brand-muted">Select a contact message to read it.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
