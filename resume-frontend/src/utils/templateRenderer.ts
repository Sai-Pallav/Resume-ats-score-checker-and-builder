/**
 * Client-side resume template renderer.
 * Replicates the Handlebars templates from the backend entirely in JavaScript.
 * This enables zero-latency live preview — no API call needed.
 */

interface ContactInfo {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
}

interface SectionData {
    type: string;
    data: any;
}

interface ResumeData {
    contactInfo: ContactInfo;
    summary: string;
    sections: SectionData[];
}

// ─── Tiny template helpers ──────────────────────────────────────────────────

function esc(s: any): string {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function contactLine(info: ContactInfo, sep = ' | '): string {
    return [info.email, info.phone, info.location, info.linkedin]
        .filter(Boolean).map(esc).join(sep);
}

// ─── Shared section renderers ────────────────────────────────────────────────

function renderExperience(data: any[]): string {
    if (!data?.length) return '';
    return data.map(item => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-title">${esc(item.title)}${item.company ? ` at ${esc(item.company)}` : ''}</span>
          <span class="entry-date">${esc(item.startDate)} – ${item.isCurrent ? 'Present' : esc(item.endDate)}</span>
        </div>
        ${item.location ? `<div class="entry-subtitle">${esc(item.location)}</div>` : ''}
        <ul>${(item.bullets || []).map((b: string) => `<li>${esc(b)}</li>`).join('')}</ul>
      </div>`).join('');
}

function renderEducation(data: any[]): string {
    if (!data?.length) return '';
    return data.map(item => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-title">${esc(item.institution)}</span>
          <span class="entry-date">${esc(item.startDate)} – ${esc(item.endDate)}</span>
        </div>
        <div class="entry-subtitle">${esc(item.degree)}${item.field ? ` in ${esc(item.field)}` : ''}${item.gpa ? ` (GPA: ${esc(item.gpa)})` : ''}</div>
        ${(item.highlights?.length) ? `<ul>${item.highlights.map((h: string) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
      </div>`).join('');
}

function renderProjects(data: any[]): string {
    if (!data?.length) return '';
    return data.map(item => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-title">${esc(item.name)}</span>
          ${item.url ? `<span class="entry-date">${esc(item.url)}</span>` : ''}
        </div>
        <p>${esc(item.description)}</p>
        <ul>
          ${item.technologies?.length ? `<li><strong>Technologies:</strong> ${item.technologies.map(esc).join(', ')}</li>` : ''}
          ${(item.highlights || []).map((h: string) => `<li>${esc(h)}</li>`).join('')}
        </ul>
      </div>`).join('');
}

function renderSkillsTagStyle(data: any): string {
    const cats = data?.categories || [];
    return cats.map((cat: any) => `
      <div style="margin-bottom:16px;">
        <div class="skill-cat">${esc(cat.name)}</div>
        <div>${(cat.items || []).map((i: string) => `<span class="skill-tag">${esc(i)}</span>`).join('')}</div>
      </div>`).join('');
}

function renderSkillsListStyle(data: any): string {
    const cats = data?.categories || [];
    return cats.map((cat: any) => `
      <div class="entry">
        <span class="entry-title">${esc(cat.name)}: </span>
        <span>${(cat.items || []).map(esc).join(', ')}</span>
      </div>`).join('');
}

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

function renderStartup(d: ResumeData): string {
    const { contactInfo: c, summary, sections } = d;
    const mainSections = sections.filter(s => s.type === 'experience' || s.type === 'projects');
    const sideSections = sections.filter(s => s.type === 'skills' || s.type === 'education');

    const mainHtml = mainSections.map(s => {
        if (s.type === 'experience') return `<h2>Experience</h2>${renderExperience(s.data)}`;
        if (s.type === 'projects') return `<h2>Projects</h2>${renderProjects(s.data)}`;
        return '';
    }).join('');

    const sideHtml = sideSections.map(s => {
        if (s.type === 'skills') return `<h2>Skills</h2>${renderSkillsTagStyle(s.data)}`;
        if (s.type === 'education') return `<h2 style="margin-top:30px;">Education</h2>${renderEducation(s.data)}`;
        return '';
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:'Inter','Roboto',sans-serif;margin:0;padding:40px;color:#111827;line-height:1.6;background:#fff;}
  .header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;border-bottom:4px solid #6366f1;padding-bottom:20px;}
  .header-left h1{font-size:42px;color:#111827;margin:0;font-weight:900;letter-spacing:-1px;}
  .header-right{text-align:right;font-size:13px;color:#4b5563;}
  .header-right div{margin-bottom:4px;}
  .content-grid{display:flex;gap:40px;}
  .main-col{width:65%;}
  .side-col{width:35%;padding-left:30px;border-left:1px solid #e5e7eb;}
  h2{font-size:20px;color:#4f46e5;margin:0 0 20px;text-transform:uppercase;letter-spacing:1px;font-weight:800;}
  .entry{margin-bottom:25px;}
  .entry-title{font-weight:800;font-size:16px;color:#111827;}
  .entry-header{display:flex;justify-content:space-between;align-items:baseline;}
  .entry-subtitle{color:#6366f1;font-weight:600;font-size:14px;margin:2px 0;}
  .entry-date{color:#6b7280;font-size:13px;font-weight:500;}
  ul{margin:8px 0 0;padding-left:18px;} li{margin-bottom:6px;font-size:14px;color:#374151;}
  .summary{font-size:15px;margin-bottom:30px;color:#4b5563;line-height:1.7;}
  .skill-tag{display:inline-block;background:#eef2ff;color:#4f46e5;padding:4px 10px;border-radius:6px;margin:0 6px 8px 0;font-size:13px;font-weight:600;}
  .skill-cat{font-weight:bold;font-size:14px;margin-bottom:8px;color:#111827;}
  p{font-size:14px;margin:5px 0 8px;}
</style></head><body>
  <div class="header">
    <div class="header-left"><h1>${esc(c.fullName)}</h1></div>
    <div class="header-right">
      ${c.email ? `<div>${esc(c.email)}</div>` : ''}
      ${c.phone ? `<div>${esc(c.phone)}</div>` : ''}
      ${c.location ? `<div>${esc(c.location)}</div>` : ''}
      ${c.linkedin ? `<div>${esc(c.linkedin)}</div>` : ''}
    </div>
  </div>
  <div class="content-grid">
    <div class="main-col">
      ${summary ? `<h2>Profile</h2><div class="summary">${esc(summary)}</div>` : ''}
      ${mainHtml}
    </div>
    <div class="side-col">${sideHtml}</div>
  </div>
</body></html>`;
}

function renderClassic(d: ResumeData): string {
    const { contactInfo: c, summary, sections } = d;
    const sectHtml = sections.map(s => {
        let body = '';
        if (s.type === 'experience') body = renderExperience(s.data);
        else if (s.type === 'education') body = renderEducation(s.data);
        else if (s.type === 'skills') body = renderSkillsListStyle(s.data);
        else if (s.type === 'projects') body = renderProjects(s.data);
        return `<h2>${s.type}</h2>${body}`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:'Georgia',serif;margin:0;padding:40px;color:#333;line-height:1.4;}
  h1{font-size:28px;margin-bottom:4px;border-bottom:2px solid #333;padding-bottom:4px;text-transform:uppercase;text-align:center;}
  h2{font-size:16px;border-bottom:1px solid #333;padding-bottom:4px;margin-top:20px;text-transform:uppercase;}
  .contact{font-size:13px;color:#666;text-align:center;margin-bottom:24px;}
  .entry{margin-bottom:12px;}
  .entry-header{display:flex;justify-content:space-between;align-items:baseline;}
  .entry-title{font-weight:bold;}
  .entry-subtitle{font-style:italic;font-size:13px;margin:2px 0;}
  .entry-date{font-size:13px;color:#555;}
  ul{margin:4px 0 12px;padding-left:20px;font-size:13px;} p{font-size:13px;margin:8px 0;}
</style></head><body>
  <h1>${esc(c.fullName)}</h1>
  <div class="contact">${contactLine(c)}</div>
  ${summary ? `<h2>Summary</h2><p>${esc(summary)}</p>` : ''}
  ${sectHtml}
</body></html>`;
}

function renderModern(d: ResumeData): string {
    const { contactInfo: c, summary, sections } = d;
    const sectHtml = sections.map(s => {
        let body = '';
        if (s.type === 'experience') body = renderExperience(s.data);
        else if (s.type === 'education') body = renderEducation(s.data);
        else if (s.type === 'skills') body = renderSkillsListStyle(s.data);
        else if (s.type === 'projects') body = renderProjects(s.data);
        return `<h2>${s.type.charAt(0).toUpperCase() + s.type.slice(1)}</h2>${body}`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:'Inter',sans-serif;margin:0;padding:0;color:#1e293b;background:#fff;}
  .header{background:linear-gradient(135deg,#1e293b,#334155);color:#fff;padding:40px 48px 32px;}
  .header h1{font-size:36px;margin:0 0 6px;font-weight:700;letter-spacing:-0.5px;}
  .contact-line{font-size:13px;color:#94a3b8;display:flex;flex-wrap:wrap;gap:16px;}
  .main{padding:32px 48px;}
  h2{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin:28px 0 14px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;}
  .entry{margin-bottom:20px;}
  .entry-header{display:flex;justify-content:space-between;align-items:baseline;}
  .entry-title{font-weight:700;font-size:15px;color:#1e293b;}
  .entry-subtitle{color:#64748b;font-size:13px;margin:3px 0;}
  .entry-date{font-size:12px;color:#94a3b8;}
  ul{margin:8px 0 0;padding-left:18px;} li{margin-bottom:5px;font-size:13px;color:#475569;}
  .summary{font-size:14px;color:#475569;line-height:1.7;margin-bottom:4px;}
  .skill-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}
  .skill-chip{background:#f1f5f9;color:#334155;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;}
  p{font-size:13px;color:#475569;margin:5px 0;}
</style></head><body>
  <div class="header">
    <h1>${esc(c.fullName)}</h1>
    <div class="contact-line">
      ${[c.email, c.phone, c.location, c.linkedin].filter(Boolean).map(v => `<span>${esc(v)}</span>`).join('')}
    </div>
  </div>
  <div class="main">
    ${summary ? `<h2>Summary</h2><p class="summary">${esc(summary)}</p>` : ''}
    ${sections.map(s => {
        let body = '';
        if (s.type === 'experience') body = renderExperience(s.data);
        else if (s.type === 'education') body = renderEducation(s.data);
        else if (s.type === 'skills') {
            const cats = s.data?.categories || [];
            body = cats.map((cat: any) =>
                `<div class="skill-row">${(cat.items || []).map((i: string) => `<span class="skill-chip">${esc(i)}</span>`).join('')}</div>`
            ).join('');
        }
        else if (s.type === 'projects') body = renderProjects(s.data);
        return `<h2>${s.type.charAt(0).toUpperCase() + s.type.slice(1)}</h2>${body}`;
    }).join('')}
  </div>
</body></html>`;
}

function renderMinimal(d: ResumeData): string {
    const { contactInfo: c, summary, sections } = d;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:'Helvetica Neue',sans-serif;margin:0;padding:48px;color:#111;line-height:1.5;background:#fff;}
  h1{font-size:30px;font-weight:300;letter-spacing:-0.5px;margin:0 0 6px;}
  .contact{font-size:12px;color:#888;margin-bottom:32px;}
  h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:#aaa;margin:28px 0 12px;}
  hr{border:none;border-top:1px solid #eeeeee;margin:0;}
  .entry{margin-bottom:16px;}
  .entry-header{display:flex;justify-content:space-between;align-items:baseline;}
  .entry-title{font-weight:600;font-size:14px;}
  .entry-subtitle{font-size:13px;color:#555;margin:2px 0;}
  .entry-date{font-size:12px;color:#aaa;}
  ul{margin:6px 0 0;padding-left:16px;} li{font-size:13px;margin-bottom:4px;color:#333;}
  p{font-size:13px;color:#333;margin:0 0 6px;}
  .tags{display:flex;flex-wrap:wrap;gap:6px;}
  .tag{font-size:12px;color:#555;border:1px solid #ddd;padding:2px 8px;border-radius:4px;}
</style></head><body>
  <h1>${esc(c.fullName)}</h1>
  <div class="contact">${contactLine(c, ' · ')}</div>
  ${summary ? `<h2>About</h2><hr/><p style="margin-top:10px;">${esc(summary)}</p>` : ''}
  ${sections.map(s => {
        let body = '';
        if (s.type === 'experience') body = renderExperience(s.data);
        else if (s.type === 'education') body = renderEducation(s.data);
        else if (s.type === 'skills') {
            const all = (s.data?.categories || []).flatMap((cat: any) => cat.items || []);
            body = `<div class="tags" style="margin-top:10px;">${all.map((i: string) => `<span class="tag">${esc(i)}</span>`).join('')}</div>`;
        }
        else if (s.type === 'projects') body = renderProjects(s.data);
        return `<h2>${s.type.charAt(0).toUpperCase() + s.type.slice(1)}</h2><hr/><div style="margin-top:10px;">${body}</div>`;
    }).join('')}
</body></html>`;
}

function renderProfessional(d: ResumeData): string {
    return renderClassic(d); // very similar structure to classic
}

function renderExecutive(d: ResumeData): string {
    return renderModern(d); // similar structure, slight style differences
}

function renderCreative(d: ResumeData): string {
    return renderStartup(d); // colourful layout similar to startup
}

function renderAcademic(d: ResumeData): string {
    return renderClassic(d); // academic uses the serif classic style
}

// ─── Public API ───────────────────────────────────────────────────────────────

const RENDERERS: Record<string, (d: ResumeData) => string> = {
    startup: renderStartup,
    classic: renderClassic,
    modern: renderModern,
    minimal: renderMinimal,
    professional: renderProfessional,
    executive: renderExecutive,
    creative: renderCreative,
    academic: renderAcademic,
};

export function renderTemplateClientSide(templateId: string, data: ResumeData): string {
    const renderer = RENDERERS[templateId] || renderModern;
    return renderer(data);
}
