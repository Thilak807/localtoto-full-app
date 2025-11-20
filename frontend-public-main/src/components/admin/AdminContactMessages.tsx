
import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.get('/admin/contact-messages');
      setMessages(res.data?.messages || []);
    } catch (err: any) {
      console.error('[AdminContactMessages] Error loading messages:', err);
      setError(err?.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Contact Messages</h1>
        <button
          onClick={loadMessages}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">Loading messages...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No contact messages yet
        </div>
      )}

      {!loading && !error && messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                msg.is_read ? 'border-gray-300' : 'border-green-500'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{msg.name}</h3>
                    {!msg.is_read && (
                      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Email:</span> {msg.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {msg.phone}
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span> {msg.subject}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {formatDate(msg.created_at)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContactMessages;

