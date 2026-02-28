import { config } from 'dotenv';
config();
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const API_BASE = 'http://localhost:3000/api/v1';
const USER_ID = 'test-user-flow-123';

const headers = {
    'Content-Type': 'application/json',
    'X-User-ID': USER_ID
};

async function runTests() {
    console.log('--- Starting System Flow Tests ---');

    // ==========================================
    // Flow 1: Create resume → export PDF.
    // ==========================================
    console.log('\n[Flow 1] Create resume -> Export PDF');

    // 1A. Create Resume
    const createRes = await fetch(`${API_BASE}/resumes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            title: 'Backend Engineer',
            summary: 'Experienced Node.js developer building APIs',
            contactInfo: { fullName: 'Flow Tester', email: 'flow@test.com' }
        })
    });

    if (!createRes.ok) throw new Error(`Create failed: ${await createRes.text()}`);
    const resumeData = (await createRes.json() as any).data;
    const resumeId = resumeData.id;
    console.log(`✅ Resume Created: ${resumeId}`);

    // 1B. Add Section
    const sectionRes = await fetch(`${API_BASE}/resumes/${resumeId}/sections`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            type: 'experience',
            data: {
                title: 'Senior Developer',
                company: 'Tech Corp',
                startDate: '2020-01',
                endDate: 'Present',
                description: ['Built scalable systems', 'Managed team of 5']
            }
        })
    });
    if (!sectionRes.ok) throw new Error(`Section failed: ${await sectionRes.text()}`);
    console.log(`✅ Section Added`);

    // 1C. Export PDF
    const pdfRes = await fetch(`${API_BASE}/resumes/${resumeId}/pdf?template=modern`, {
        headers: { 'X-User-ID': USER_ID } // No Content-Type for GET
    });
    if (!pdfRes.ok) throw new Error(`PDF Export failed: ${await pdfRes.text()}`);

    const pdfBuffer = await pdfRes.arrayBuffer();
    const pdfPath = path.join(__dirname, 'test-export.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
    console.log(`✅ PDF Exported (${pdfBuffer.byteLength} bytes) to ${pdfPath}`);

    // ==========================================
    // Flow 2: Upload PDF → ATS
    // ==========================================
    console.log('\n[Flow 2] Upload PDF -> ATS Analysis');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));

    const atsUploadRes = await fetch(`${API_BASE}/ats/analyze`, {
        method: 'POST',
        headers: {
            'X-User-ID': USER_ID,
            ...formData.getHeaders()
        },
        body: formData
    });

    if (!atsUploadRes.ok) throw new Error(`ATS Upload failed: ${await atsUploadRes.text()}`);
    const atsResult = await atsUploadRes.json() as any;
    console.log(`✅ ATS Analyzed Uploaded PDF. Overall Score: ${atsResult.overallScore}`);

    // ==========================================
    // Flow 3: Analyze saved resume.
    // ==========================================
    console.log('\n[Flow 3] Analyze Saved Resume -> ATS');

    const atsSavedRes = await fetch(`${API_BASE}/ats/analyze-resume/${resumeId}`, {
        method: 'POST',
        headers
    });

    if (!atsSavedRes.ok) throw new Error(`ATS Saved Analysis failed: ${await atsSavedRes.text()}`);
    const atsSavedResult = await atsSavedRes.json() as any;
    console.log(`✅ ATS Analyzed Saved Resume. Overall Score: ${atsSavedResult.overallScore}`);
    const reportId = atsSavedResult.reportId;

    // ==========================================
    // Flow 4: Delete resume → ATS report survives.
    // ==========================================
    console.log('\n[Flow 4] Delete Resume -> ATS DB Check');

    const deleteRes = await fetch(`${API_BASE}/resumes/${resumeId}`, {
        method: 'DELETE',
        headers
    });

    if (!deleteRes.ok) throw new Error(`Resume deletion failed: ${await deleteRes.text()}`);
    console.log(`✅ Resume Deleted`);

    // Manually verify DB using Prisma to prove ATS report survives via SetNull
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const survivorReport = await prisma.atsReport.findUnique({
        where: { id: reportId }
    });

    if (survivorReport && survivorReport.resumeId === null) {
        console.log(`✅ ATS Report Survived Deletion (resumeId is correctly null)`);
    } else {
        throw new Error('ATS Report did not survive or resumeId is not null!');
    }

    // Cleanup 
    await prisma.atsReport.deleteMany({ where: { externalUserId: USER_ID } });
    await prisma.$disconnect();
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

    console.log('\n🎉 ALL FLOWS COMPLETED SUCCESSFULLY 🎉');
}

runTests().catch(console.error);
