import { Platform } from 'react-native';

interface AtsResults {
    overallScore: number;
    label: string;
    color: string;
    hasJd: boolean;
    keywords?: {
        matched: string[];
        missing: string[];
        matchedHard?: string[];
        matchedSoft?: string[];
        score: number;
    };
    breakdown?: {
        keyword?: { score: number };
        sections?: { score: number };
        formatting?: { score: number };
        readability?: { score: number };
    };
    suggestions?: { suggestions: Array<{ id: string; priority: string; title: string; message: string; keywords?: string[] }> };
    metadata?: { fileName?: string; analyzedAt?: string };
}

const generateHtml = (results: AtsResults): string => {
    const matched = results.keywords?.matched || [];
    const missing = results.keywords?.missing || [];
    const matchedHard = results.keywords?.matchedHard || [];
    const matchedSoft = results.keywords?.matchedSoft || [];
    const suggestions = results.suggestions?.suggestions || [];

    const skillChips = (skills: string[], color: string) =>
        skills.map(s => `<span style="background:${color}15;color:${color};border:1px solid ${color}40;padding:2px 8px;border-radius:12px;font-size:11px;margin:2px;display:inline-block;">${s}</span>`).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>ATS Intelligence Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f9fc; color: #1a1d27; padding: 32px; }
  .header { text-align:center; margin-bottom:32px; }
  .header h1 { font-size:22px; font-weight:700; letter-spacing:2px; color:#3b4cca; }
  .header p { font-size:12px; color:#6b7280; margin-top:4px; }
  .score-hero { display:flex; align-items:center; justify-content:center; gap:32px; padding:24px; background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,0.06); margin-bottom:24px; }
  .score-circle { width:100px; height:100px; border-radius:50%; background:conic-gradient(${results.color || '#3b4cca'} ${results.overallScore}%, #e5e7eb 0%); display:flex; align-items:center; justify-content:center; }
  .score-inner { width:80px; height:80px; background:#fff; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .score-num { font-size:24px; font-weight:800; color:${results.color || '#3b4cca'}; }
  .score-label { font-size:11px; color:#6b7280; }
  .breakdown { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-bottom:24px; }
  .metric { background:#fff; padding:16px; border-radius:12px; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
  .metric-label { font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:1px; }
  .metric-value { font-size:22px; font-weight:800; color:#1a1d27; margin-top:4px; }
  .skills-section { background:#fff; padding:20px; border-radius:12px; box-shadow:0 1px 4px rgba(0,0,0,0.05); margin-bottom:24px; }
  .skills-section h2 { font-size:14px; font-weight:700; color:#1a1d27; margin-bottom:12px; }
  .suggestions { margin-bottom:24px; }
  .suggestion { padding:14px; border-radius:10px; margin-bottom:8px; border-left:4px solid #ccc; background:#fff; }
  .suggestion.HIGH { border-color:#ef4444; }
  .suggestion.MEDIUM { border-color:#f59e0b; }
  .suggestion.LOW { border-color:#10b981; }
  .sug-title { font-size:13px; font-weight:700; }
  .sug-msg { font-size:12px; color:#6b7280; margin-top:4px; }
  .footer { text-align:center; font-size:10px; color:#9ca3af; margin-top:24px; }
  @media print { body { background:#fff; padding:16px; } }
</style>
</head>
<body>
 <div class="header">
   <h1>ATS INTELLIGENCE REPORT</h1>
   <p>Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
   ${results.metadata?.fileName ? `<p>Resume: ${results.metadata.fileName}</p>` : ''}
 </div>

 <div class="score-hero">
   <div class="score-circle"><div class="score-inner"><span class="score-num">${results.overallScore}</span><span class="score-label">%</span></div></div>
   <div>
     <p style="font-size:18px;font-weight:700;">${results.label || 'Good'}</p>
     <p style="font-size:12px;color:#6b7280;">${results.hasJd ? 'Job-Targeted Scan' : 'General Skill Scan'}</p>
   </div>
 </div>

 <div class="breakdown">
   <div class="metric"><div class="metric-label">${results.hasJd ? 'JD Match' : 'Market Strength'}</div><div class="metric-value">${Math.round(results.breakdown?.keyword?.score || 0)}%</div></div>
   <div class="metric"><div class="metric-label">Structure</div><div class="metric-value">${Math.round(results.breakdown?.sections?.score || 0)}%</div></div>
   <div class="metric"><div class="metric-label">Formatting</div><div class="metric-value">${Math.round(results.breakdown?.formatting?.score || 0)}%</div></div>
   <div class="metric"><div class="metric-label">Readability</div><div class="metric-value">${Math.round(results.breakdown?.readability?.score || 0)}%</div></div>
 </div>

 ${matchedHard.length > 0 || matchedSoft.length > 0 ? `
 <div class="skills-section">
   <h2>Technical Competencies</h2>
   <div>${skillChips(matchedHard, '#3b4cca')}</div>
   ${matchedSoft.length > 0 ? `<h2 style="margin-top:14px;">Soft Skills</h2><div>${skillChips(matchedSoft, '#10b981')}</div>` : ''}
 </div>` : matched.length > 0 ? `
 <div class="skills-section">
   <h2>Matched Keywords</h2>
   <div>${skillChips(matched, '#3b4cca')}</div>
 </div>` : ''}

 ${missing.length > 0 ? `
 <div class="skills-section">
   <h2>Missing Keywords — Add to Resume</h2>
   <div>${skillChips(missing, '#ef4444')}</div>
 </div>` : ''}

 <div class="suggestions">
   <h2 style="font-size:14px;font-weight:700;margin-bottom:12px;">Action Items (${suggestions.length})</h2>
   ${suggestions.map(s => `
     <div class="suggestion ${s.priority}">
       <div class="sug-title">${s.title}</div>
       <div class="sug-msg">${s.message}</div>
     </div>`).join('')}
 </div>

 <div class="footer">Generated by ATS Intelligence &bull; Resume ATS Score Checker</div>
</body>
</html>`;
};

export const exportAsPdf = async (results: AtsResults) => {
    const html = generateHtml(results);

    if (Platform.OS === 'web') {
        // Web: Open a new window with the report HTML and trigger print dialog
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 500);
        }
    } else {
        // Native: Use expo-print + expo-sharing
        try {
            const Print = require('expo-print');
            const Sharing = require('expo-sharing');
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share ATS Report' });
        } catch (err) {
            console.error('Failed to export PDF:', err);
        }
    }
};
