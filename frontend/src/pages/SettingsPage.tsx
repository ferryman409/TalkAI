import { useState } from 'react';
import { exportData, deleteAllData } from '../api/user';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export function SettingsPage() {
  const [deleteModal, setDeleteModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setMessage('');
    try {
      const blob = await exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbot-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('数据导出成功');
    } catch {
      setMessage('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAllData();
      setDeleteModal(false);
      setMessage('所有数据已永久删除');
    } catch {
      setMessage('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-espresso mb-6">设置</h1>

      {message && (
        <div className="mb-4 p-3 bg-sage/10 border border-sage/30 rounded-xl text-sm text-sage">{message}</div>
      )}

      <div className="space-y-6">
        {/* Export */}
        <div className="bg-warm-white border border-tan/60 rounded-2xl p-6">
          <h2 className="font-semibold text-espresso mb-2">导出数据</h2>
          <p className="text-sm text-mocha mb-4">
            下载你的所有对话记录、记忆和创建的角色数据，格式为 JSON。
          </p>
          <Button onClick={handleExport} disabled={exporting} variant="secondary">
            {exporting ? '导出中...' : '导出我的数据'}
          </Button>
        </div>

        {/* Delete */}
        <div className="bg-warm-white border border-rose-light/50 rounded-2xl p-6">
          <h2 className="font-semibold text-espresso mb-2 text-rose">删除所有数据</h2>
          <p className="text-sm text-mocha mb-4">
            永久删除你的所有对话记录、记忆和相关数据。此操作不可撤销。
          </p>
          <Button onClick={() => setDeleteModal(true)} variant="danger">
            删除所有数据
          </Button>
        </div>

        {/* Privacy Note */}
        <div className="bg-golden/30 border border-tan/40 rounded-2xl p-4 text-sm text-mocha">
          <p className="font-medium text-espresso mb-1">🔒 隐私说明</p>
          <p>对话内容在存储前会进行加密。我们不会将你的对话数据用于模型训练。你随时可以导出或删除自己的数据。</p>
        </div>
      </div>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="确认删除所有数据">
        <p className="text-sm text-mocha mb-4">
          此操作将永久删除你的所有对话记录、记忆和相关数据，且无法恢复。确定要继续吗？
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(false)}>取消</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? '删除中...' : '确认删除'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
