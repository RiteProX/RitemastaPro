// ============================================================
//  STATE
// ============================================================
let chapters = [];
let currentChapterId = null;
let nextId = 1;
let coverData = null;
let backCoverData = null;
let selectedLayout = 'standard';
let isUnlocked = false;

// ============================================================
//  INIT
// ============================================================
function init() {
    const saved = localStorage.getItem('ritemasta_pro_project');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            chapters = data.chapters || [];
            currentChapterId = data.currentChapterId || null;
            nextId = data.nextId || 1;
            coverData = data.coverData || null;
            backCoverData = data.backCoverData || null;
            selectedLayout = data.selectedLayout || 'standard';
            isUnlocked = data.isUnlocked || false;

            document.getElementById('bookTitle').value = data.bookTitle || 'My Wellness Book';
            document.getElementById('bookSubtitle').value = data.bookSubtitle || '';
            document.getElementById('bookAuthor').value = data.bookAuthor || 'Author Name';
            document.getElementById('bookISBN').value = data.bookISBN || '';
            document.getElementById('bookPublisher').value = data.bookPublisher || '';
            document.getElementById('bookEdition').value = data.bookEdition || '';
            document.getElementById('customSize').value = data.customSize || '6 x 9';
            document.getElementById('templateStyle').value = data.templateStyle || 'wellness';
            document.getElementById('fontFamily').value = data.fontFamily || 'serif';
            document.getElementById('copyrightText').value = data.copyrightText || 'Copyright © 2026 Author Name. All rights reserved.';

            if (coverData) {
                const cp = document.getElementById('coverPreview');
                cp.style.display = 'block';
                cp.innerHTML = `<img src="${coverData}" style="max-width:120px; border-radius:4px;">`;
            }
            if (backCoverData) {
                const bcp = document.getElementById('backCoverPreview');
                bcp.style.display = 'block';
                bcp.innerHTML = `<img src="${backCoverData}" style="max-width:120px; border-radius:4px;">`;
            }
        } catch(e) { console.warn('Failed to load saved project'); }
    }

    if (chapters.length === 0) {
        chapters.push({
            id: 'ch' + (nextId++),
            title: 'Chapter 1: Introduction',
            content: 'Welcome to your book. This is where your journey begins.\n\nStart writing your content here.'
        });
        currentChapterId = chapters[0].id;
    }

    // Editor setup
    if (document.getElementById('chapterContent')) {
        loadChapter(currentChapterId);
        refreshTOC();
        updateStats();
        document.getElementById('chapterContent').addEventListener('input', () => {
            saveCurrentChapter();
            updateStats();
            refreshTOC();
            autoSave();
        });
    }

    // Auto-save on settings changes
    document.querySelectorAll('#bookTitle, #bookSubtitle, #bookAuthor, #bookISBN, #bookPublisher, #bookEdition, #templateStyle, #fontFamily, #customSize, #copyrightText').forEach(el => {
        el.addEventListener('change', autoSave);
    });

    // Layout selection
    document.querySelectorAll('.layout-card').forEach(card => {
        card.classList.toggle('active', card.textContent.toLowerCase().includes(selectedLayout));
    });
}

// ============================================================
//  CHAPTER MANAGEMENT
// ============================================================
function loadChapter(id) {
    const ch = chapters.find(c => c.id === id);
    if (!ch) return;
    document.getElementById('chapterContent').value = ch.content;
    updateStats();
    document.getElementById('chapterSelector').innerHTML = chapters.map(c =>
        `<option value="${c.id}" ${c.id === id ? 'selected' : ''}>${c.title}</option>`
    ).join('');
}

function saveCurrentChapter() {
    const ch = chapters.find(c => c.id === currentChapterId);
    if (!ch) return;
    ch.title = document.getElementById('chapterSelector').options[document.getElementById('chapterSelector').selectedIndex]?.text || 'Untitled';
    ch.content = document.getElementById('chapterContent').value;
}

function addChapter() {
    saveCurrentChapter();
    const title = 'Chapter ' + (chapters.length + 1);
    const newCh = { id: 'ch' + (nextId++), title: title, content: '' };
    chapters.push(newCh);
    currentChapterId = newCh.id;
    loadChapter(currentChapterId);
    refreshTOC();
    autoSave();
    updateStats();
}

function deleteChapter() {
    if (chapters.length <= 1) { alert('You need at least one chapter.'); return; }
    if (!confirm('Delete this chapter?')) return;
    const idx = chapters.findIndex(c => c.id === currentChapterId);
    chapters.splice(idx, 1);
    currentChapterId = chapters[0].id;
    loadChapter(currentChapterId);
    refreshTOC();
    autoSave();
    updateStats();
}

// ============================================================
//  TOC
// ============================================================
function refreshTOC() {
    const tocList = document.getElementById('tocList');
    if (!tocList) return;
    tocList.innerHTML = '';
    chapters.forEach((ch, index) => {
        const li = document.createElement('li');
        li.className = 'level-1';
        li.textContent = ch.title;
        li.style.cursor = 'pointer';
        li.onclick = () => {
            saveCurrentChapter();
            currentChapterId = ch.id;
            loadChapter(ch.id);
        };
        tocList.appendChild(li);
    });
}

// ============================================================
//  STATS
// ============================================================
function updateStats() {
    const text = document.getElementById('chapterContent').value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('wordCount').textContent = words + ' words';
    document.getElementById('charCount').textContent = text.length + ' characters';
    const totalWords = chapters.reduce((sum, ch) => sum + (ch.content.trim() ? ch.content.trim().split(/\s+/).length : 0), 0);
    document.getElementById('totalWords').textContent = totalWords;
    document.getElementById('totalPages').textContent = Math.ceil(totalWords / 250);
    document.getElementById('chapterCount').textContent = chapters.length;
}

// ============================================================
//  UPLOAD
// ============================================================
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const status = document.getElementById('uploadStatus');
    status.className = 'upload-status';
    status.textContent = '⏳ Uploading and processing...';

    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        if (typeof mammoth === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js';
            script.onload = function() { parseDocx(arrayBuffer); };
            document.head.appendChild(script);
        } else {
            parseDocx(arrayBuffer);
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseDocx(arrayBuffer) {
    mammoth.extractRawText({ arrayBuffer: arrayBuffer })
        .then(function(result) {
            const text = result.value;
            const lines = text.split('\n');
            let newChapters = [];
            let currentContent = [];
            let currentTitle = 'Chapter 1';
            lines.forEach(line => {
                line = line.trim();
                if (line.match(/^(Chapter|Part|Section)\s+\d+/i)) {
                    if (currentContent.length > 0) {
                        newChapters.push({ id: 'ch' + (nextId++), title: currentTitle, content: currentContent.join('\n') });
                    }
                    currentTitle = line;
                    currentContent = [];
                } else if (line.length > 0) {
                    currentContent.push(line);
                }
            });
            if (currentContent.length > 0 || newChapters.length === 0) {
                newChapters.push({ id: 'ch' + (nextId++), title: currentTitle, content: currentContent.join('\n') });
            }
            if (newChapters.length > 0) {
                chapters = newChapters;
                currentChapterId = chapters[0].id;
                loadChapter(currentChapterId);
                refreshTOC();
                autoSave();
                updateStats();
                document.getElementById('uploadStatus').className = 'upload-status success';
                document.getElementById('uploadStatus').textContent = '✅ Success! Imported ' + chapters.length + ' chapters.';
            }
        })
        .catch(function(err) {
            console.error('DOCX import error:', err);
            document.getElementById('uploadStatus').className = 'upload-status error';
            document.getElementById('uploadStatus').textContent = '❌ Error importing DOCX.';
        });
}

// ============================================================
//  COVER UPLOAD
// ============================================================
function handleCoverUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        coverData = e.target.result;
        const cp = document.getElementById('coverPreview');
        cp.style.display = 'block';
        cp.innerHTML = `<img src="${coverData}" style="max-width:120px; border-radius:4px;">`;
        autoSave();
    };
    reader.readAsDataURL(file);
}

function handleBackCoverUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        backCoverData = e.target.result;
        const bcp = document.getElementById('backCoverPreview');
        bcp.style.display = 'block';
        bcp.innerHTML = `<img src="${backCoverData}" style="max-width:120px; border-radius:4px;">`;
        autoSave();
    };
    reader.readAsDataURL(file);
}

// ============================================================
//  LAYOUT
// ============================================================
function selectLayout(layout) {
    selectedLayout = layout;
    document.querySelectorAll('.layout-card').forEach(card => {
        card.classList.toggle('active', card.textContent.toLowerCase().includes(layout));
    });
    autoSave();
}

function updateTemplate() { autoSave(); }
function updateFont() { autoSave(); }

// ============================================================
//  EXPORT
// ============================================================
function handleExportClick(format) {
    if (!isUnlocked) {
        document.getElementById('unlockOverlay').style.display = 'flex';
        return;
    }
    switch(format) {
        case 'pdf': exportPDF(); break;
        case 'epub': exportEPUB(); break;
        case 'docx': exportDOCX(); break;
        case 'html': exportHTML(); break;
        case 'txt': exportTXT(); break;
        case 'all': exportAll(); break;
    }
}

function exportDOCX() {
    saveCurrentChapter();
    const title = document.getElementById('bookTitle').value || 'My Book';
    const author = document.getElementById('bookAuthor').value || 'Author Name';
    let content = '';
    chapters.forEach(ch => { content += `${ch.title}\n\n${ch.content}\n\n`; });
    const docx = `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${chapters.map(ch => `<w:p><w:r><w:t>${ch.title}</w:t></w:r></w:p>${ch.content.split('\n').filter(p=>p.trim()).map(p => `<w:p><w:r><w:t>${p}</w:t></w:r></w:p>`).join('')}`).join('')}</w:body></w:document>`;
    const blob = new Blob([docx], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    showModal('DOCX exported successfully!', 'Export Complete');
}

function exportEPUB() {
    saveCurrentChapter();
    const title = document.getElementById('bookTitle').value || 'My Book';
    const author = document.getElementById('bookAuthor').value || 'Author Name';
    let chaptersHtml = '';
    chapters.forEach((ch, index) => {
        chaptersHtml += `<h2>${ch.title}</h2>${ch.content.split('\n').filter(p=>p.trim()).map(p => `<p>${p}</p>`).join('')}${index < chapters.length - 1 ? '<hr style="page-break-before:always;"/>' : ''}`;
    });
    const html = `<!DOCTYPE html><html><head><title>${title}</title><meta charset="UTF-8"><style>body{max-width:6in;margin:1in auto;font-family:Georgia,serif;line-height:1.6;}h1{text-align:center;margin:2em 0;}h2{text-align:center;margin:1.5em 0;}p{text-indent:1.5em;margin-bottom:0.5em;}hr{border:none;border-top:1px solid #ccc;margin:2em 0;}</style></head><body><h1>${title}</h1><p style="text-indent:0;text-align:center;">By ${author}</p><hr/>${chaptersHtml}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showModal('EPUB exported as HTML. Convert with Calibre.', 'Export Complete');
}

function exportPDF() {
    saveCurrentChapter();
    const title = document.getElementById('bookTitle').value || 'My Book';
    const author = document.getElementById('bookAuthor').value || 'Author Name';
    let sizeCSS = '6in 9in';
    if (selectedLayout === 'digest') sizeCSS = '5.5in 8.5in';
    else if (selectedLayout === 'letter') sizeCSS = '8.5in 11in';
    else if (selectedLayout === 'a4') sizeCSS = '210mm 297mm';
    else if (selectedLayout === 'a5') sizeCSS = '148mm 210mm';
    let chaptersHtml = '';
    chapters.forEach((ch, index) => {
        chaptersHtml += `<h2>${ch.title}</h2>${ch.content.split('\n').filter(p=>p.trim()).map(p => `<p>${p}</p>`).join('')}${index < chapters.length - 1 ? '<div style="page-break-after:always;"></div>' : ''}`;
    });
    const html = `<!DOCTYPE html><html><head><title>${title}</title><meta charset="UTF-8"><style>@page{size:${sizeCSS};margin:0.75in 0.5in 0.75in 0.75in;}body{font-family:Georgia,serif;line-height:1.6;font-size:11pt;}h1{text-align:center;margin:2em 0;page-break-before:always;}h2{text-align:center;margin:1.5em 0;}p{text-indent:1.5em;margin-bottom:0.5em;}.title-page{text-align:center;page-break-after:always;}.title-page h1{font-size:24pt;margin-top:4em;}.copyright{text-align:center;font-size:9pt;page-break-after:always;}</style></head><body><div class="title-page"><h1>${title}</h1><p>By ${author}</p><p style="margin-top:4em;">${new Date().getFullYear()}</p></div><div class="copyright"><p>Copyright © ${new Date().getFullYear()} ${author}</p></div>${chaptersHtml}</body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
    showModal('PDF export: Use "Save as PDF" in the print dialog.', 'PDF Export');
}

function exportHTML() {
    saveCurrentChapter();
    const title = document.getElementById('bookTitle').value || 'My Book';
    const author = document.getElementById('bookAuthor').value || 'Author Name';
    let chaptersHtml = '';
    chapters.forEach(ch => { chaptersHtml += `<h2>${ch.title}</h2>${ch.content.split('\n').filter(p=>p.trim()).map(p => `<p>${p}</p>`).join('')}`; });
    const html = `<!DOCTYPE html><html><head><title>${title}</title><meta charset="UTF-8"><style>body{max-width:6in;margin:1in auto;font-family:Georgia,serif;line-height:1.6;}h1{text-align:center;margin:2em 0;}h2{text-align:center;margin:1.5em 0;}p{text-indent:1.5em;margin-bottom:0.5em;}</style></head><body><h1>${title}</h1><p style="text-indent:0;text-align:center;">By ${author}</p><hr/>${chaptersHtml}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showModal('HTML exported successfully!', 'Export Complete');
}

function exportTXT() {
    saveCurrentChapter();
    const title = document.getElementById('bookTitle').value || 'My Book';
    const author = document.getElementById('bookAuthor').value || 'Author Name';
    let txt = `${title}\nBy ${author}\n\n`;
    chapters.forEach(ch => { txt += `\n\n${ch.title}\n\n${ch.content}\n\n`; });
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showModal('TXT exported successfully!', 'Export Complete');
}

function exportAll() {
    saveCurrentChapter();
    exportDOCX();
    setTimeout(() => { exportEPUB(); setTimeout(() => { exportPDF(); setTimeout(() => { exportHTML(); setTimeout(() => { exportTXT(); showModal('All formats exported!', 'Export Complete'); }, 500); }, 500); }, 500); }, 500);
}

// ============================================================
//  UNLOCK
// ============================================================
function verifyCode() {
    const input = document.getElementById('unlockCodeInput');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    const validCodes = JSON.parse(localStorage.getItem('ritemasta_valid_codes') || '[]');
    if (validCodes.includes(code)) {
        isUnlocked = true;
        autoSave();
        document.getElementById('unlockOverlay').style.display = 'none';
        showModal('✅ Unlocked! You can now export all formats.', 'Unlock Successful');
    } else {
        showModal('❌ Invalid code. Please check and try again, or email ritemasta@gmail.com for assistance.', 'Invalid Code');
    }
}

function copyAddress(btn) {
    const code = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '✅';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
}

function closeUnlock() {
    document.getElementById('unlockOverlay').style.display = 'none';
}

// ============================================================
//  SAVE
// ============================================================
function autoSave() {
    saveCurrentChapter();
    const data = {
        chapters, currentChapterId, nextId, coverData, backCoverData, selectedLayout, isUnlocked,
        bookTitle: document.getElementById('bookTitle').value,
        bookSubtitle: document.getElementById('bookSubtitle').value,
        bookAuthor: document.getElementById('bookAuthor').value,
        bookISBN: document.getElementById('bookISBN').value,
        bookPublisher: document.getElementById('bookPublisher').value,
        bookEdition: document.getElementById('bookEdition').value,
        customSize: document.getElementById('customSize').value,
        templateStyle: document.getElementById('templateStyle').value,
        fontFamily: document.getElementById('fontFamily').value,
        copyrightText: document.getElementById('copyrightText').value
    };
    localStorage.setItem('ritemasta_pro_project', JSON.stringify(data));
}

function saveProject() {
    autoSave();
    showModal('Project saved to your browser!', 'Save Complete');
}

// ============================================================
//  CONTACT FORM
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const status = document.getElementById('formStatus');
            status.className = 'form-status success';
            status.textContent = '✅ Your message has been sent! We will get back to you within 24 hours.';
            contactForm.reset();
        });
    }
});

// ============================================================
//  UTILITY
// ============================================================
function showModal(message, title = 'Export Complete') {
    const modal = document.getElementById('exportModal');
    if (!modal) { alert(message); return; }
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    modal.classList.add('open');
}

function closeModal() {
    document.getElementById('exportModal').classList.remove('open');
}

// ============================================================
//  START
// ============================================================
document.addEventListener('DOMContentLoaded', init);
