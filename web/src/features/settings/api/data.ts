import { getToken } from '../../auth/api/auth';

const API_URL = '/api/data';

export const exportData = async (format: 'json' | 'csv' = 'json') => {
    const token = getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    const res = await fetch(`${API_URL}/export?format=${format}`, { headers });
    if (!res.ok) throw new Error('Export failed');

    // Trigger download
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'csv' ? 'wafir_transactions.csv' : 'wafir_backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

export const importData = async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/import`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!res.ok) throw new Error('Import failed');
    return res.json();
};
