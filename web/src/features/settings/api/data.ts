import { apiClient } from '../../../lib/api_client';
import { getUserProfile } from '../../users/api/users';

// Interfaces for Type Safety
interface AssetAccount {
    id: number;
    name: string;
    type: string;
    currencyCode: string;
}

interface PortfolioItem {
    id: string;
    amount: string;
    asset: { name: string; type: string };
}

interface BudgetEnvelope {
    id: string;
    name: string;
    limitAmount: string;
    spent?: number;
}

interface FullReportData {
    profile: any;
    accounts: AssetAccount[];
    portfolio: PortfolioItem[];
    envelopes: BudgetEnvelope[];
    timestamp: string;
}

import * as XLSX from 'xlsx';

export const exportUserFinancialData = async (format: 'json' | 'csv' | 'pdf' | 'excel') => {
    console.log('exportUserFinancialData [V2] called with format:', format);
    try {
        // 1. Fetch ALL Data
        const profile = await getUserProfile();
        if (!profile) throw new Error('Failed to fetch profile');

        // Fetch other data in parallel
        const [accountsRes, portfolioRes, envelopesRes] = await Promise.allSettled([
            apiClient('/assets/accounts'),
            apiClient('/investments/portfolio'),
            apiClient('/budget/envelopes')
        ]);

        const accounts = accountsRes.status === 'fulfilled' ? await accountsRes.value.json() : [];
        const portfolio = portfolioRes.status === 'fulfilled' ? await portfolioRes.value.json() : [];
        const envelopes = envelopesRes.status === 'fulfilled' ? await envelopesRes.value.json() : [];

        const fullData: FullReportData = {
            profile,
            accounts,
            portfolio,
            envelopes,
            timestamp: new Date().toISOString()
        };

        // 2. Route by Format
        if (format === 'pdf') {
            printReport(fullData);
            return;
        }

        if (format === 'excel') {
            // Create Workbook
            const wb = XLSX.utils.book_new();

            // Sheet 1: Profile
            const profileData = [
                ['Name', profile.name],
                ['Email', profile.email],
                ['Risk Tolerance', profile.settings?.profile?.riskTolerance || 'Not Set'],
                ['Timestamp', fullData.timestamp]
            ];
            const wsProfile = XLSX.utils.aoa_to_sheet(profileData);
            XLSX.utils.book_append_sheet(wb, wsProfile, "Profile");

            // Sheet 2: Assets
            const assetsData = accounts.map((acc: AssetAccount) => ({
                Name: acc.name,
                Type: acc.type,
                Currency: acc.currencyCode
            }));
            if (assetsData.length > 0) {
                const wsAssets = XLSX.utils.json_to_sheet(assetsData);
                XLSX.utils.book_append_sheet(wb, wsAssets, "Assets");
            }

            // Sheet 3: Investments
            const investData = portfolio.map((item: PortfolioItem) => ({
                Asset: item.asset.name,
                Type: item.asset.type,
                Amount: Number(item.amount) // Ensure number for math
            }));
            if (investData.length > 0) {
                const wsInvest = XLSX.utils.json_to_sheet(investData);
                XLSX.utils.book_append_sheet(wb, wsInvest, "Investments");
            }

            // Sheet 4: Budget
            const budgetData = envelopes.map((env: BudgetEnvelope) => ({
                Category: env.name,
                Limit: Number(env.limitAmount),
                Spent: Number(env.spent || 0),
                Remaining: Number(env.limitAmount) - Number(env.spent || 0)
            }));
            if (budgetData.length > 0) {
                const wsBudget = XLSX.utils.json_to_sheet(budgetData);
                XLSX.utils.book_append_sheet(wb, wsBudget, "Budget");
            }

            // Write File
            XLSX.writeFile(wb, "wafir_report.xlsx");
            return;
        }

        if (format === 'csv') {
            // Strict CSV Logic
            const filename = 'wafir_full_data.csv';
            const mimeType = 'text/csv;charset=utf-8;';
            let content = '\uFEFF'; // BOM

            // Flatten Data for CSV
            // Section 1: Profile
            content += '--- Profile ---\n';
            content += `Name,${profile.name}\n`;
            content += `Email,${profile.email}\n`;
            content += `Risk Tolerance,${profile.settings?.profile?.riskTolerance}\n\n`;

            // Section 2: Assets
            content += '--- Assets ---\n';
            content += 'Name,Type,Currency\n';
            accounts.forEach((acc: AssetAccount) => {
                content += `${acc.name},${acc.type},${acc.currencyCode}\n`;
            });
            content += '\n';

            // Section 3: Investments
            content += '--- Investments ---\n';
            content += 'Asset,Type,Amount\n';
            portfolio.forEach((item: PortfolioItem) => {
                content += `${item.asset.name},${item.asset.type},${item.amount}\n`;
            });
            content += '\n';

            // Section 4: Budget
            content += '--- Budget Envelopes ---\n';
            content += 'Category,Limit,Spent\n';
            envelopes.forEach((env: BudgetEnvelope) => {
                content += `${env.name},${env.limitAmount},${env.spent || 0}\n`;
            });

            downloadFile(content, filename, mimeType);
        } else {
            // JSON Default (Full Backup)
            downloadFile(JSON.stringify(fullData, null, 2), 'wafir_backup.json', 'application/json');
        }

    } catch (e) {
        console.error('Export Error:', e);
        alert('Failed to export data: ' + (e as Error).message);
    }
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

const printReport = (data: FullReportData) => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
        alert('Please allow popups to print report');
        return;
    }

    // Render HTML Report
    const html = `
        <html dir="rtl" lang="ar">
        <head>
            <title>تقرير وفير المالي الشامل</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 900px; mx-auto; }
                h1 { color: #10b981; text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
                h2 { color: #059669; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                .meta { text-align: center; color: #666; margin-bottom: 30px; font-size: 0.9em; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                th, td { border: 1px solid #e5e7eb; padding: 10px 14px; text-align: right; }
                th { background-color: #f9fafb; font-weight: 600; color: #111827; }
                td { background-color: #fff; }
                tr:nth-child(even) td { background-color: #f9fafb; } 
                .section { margin-bottom: 40px; }
                .footer { margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <h1>تقرير وفير المالي الشامل</h1>
            <div class="meta">تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</div>
            
            <div class="section">
                <h2>الملف الشخصي (Profile)</h2>
                <table>
                    <tr><th>الاسم</th><td>${data.profile.name || '-'}</td></tr>
                    <tr><th>البريد الإلكتروني</th><td>${data.profile.email || '-'}</td></tr>
                    <tr><th>رقم الهاتف</th><td>${data.profile.settings?.profile?.phone || '-'}</td></tr>
                    <tr><th>العمر</th><td>${data.profile.settings?.profile?.age || '-'}</td></tr>
                    <tr><th>تحمل المخاطر</th><td>${data.profile.settings?.profile?.riskTolerance || 'غير محدد'}</td></tr>
                </table>
            </div>

            <div class="section">
                <h2>الأصول (Assets)</h2>
                ${data.accounts.length > 0 ? `
                <table>
                    <thead>
                        <tr><th>الاسم</th><th>النوع</th><th>العملة</th></tr>
                    </thead>
                    <tbody>
                        ${data.accounts.map(acc => `<tr><td>${acc.name}</td><td>${acc.type}</td><td>${acc.currencyCode}</td></tr>`).join('')}
                    </tbody>
                </table>
                ` : '<p>لا توجد أصول مسجلة.</p>'}
            </div>

            <div class="section">
                <h2>الاستثمارات (Investments)</h2>
                ${data.portfolio.length > 0 ? `
                <table>
                    <thead>
                        <tr><th>الأصل</th><th>النوع</th><th>القيمة المستثمرة</th></tr>
                    </thead>
                    <tbody>
                        ${data.portfolio.map(item => `<tr><td>${item.asset.name}</td><td>${item.asset.type}</td><td>${item.amount}</td></tr>`).join('')}
                    </tbody>
                </table>
                ` : '<p>لا توجد استثمارات.</p>'}
            </div>

            <div class="section">
                <h2>الميزانية (Budget)</h2>
                ${data.envelopes.length > 0 ? `
                <table>
                    <thead>
                        <tr><th>الفئة (Envelope)</th><th>الحد الشهري (Limit)</th><th>المنفق (Spent)</th></tr>
                    </thead>
                    <tbody>
                        ${data.envelopes.map(env => `<tr><td>${env.name}</td><td>${env.limitAmount}</td><td>${env.spent || 0}</td></tr>`).join('')}
                    </tbody>
                </table>
                ` : '<p>لم يتم إعداد ميزانية.</p>'}
            </div>

            <div class="footer">
                Wafir App - Comprehensive Financial Report <br>
                Generated Automatically
            </div>
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};

export const importData = async (file: File) => {
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        console.log('Imported Data:', data);
        alert('Data imported successfully (Check Console suitable for MVP). Refresh to see changes if logic applied.');
        return data;
    } catch (e) {
        console.error('Import Error:', e);
        throw new Error('Invalid file format');
    }
};
