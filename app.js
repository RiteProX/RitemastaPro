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

// DOM refs (will be set per page)
let chapterContent, chapterSelector, tocList;
let wordCountEl, charCountEl, chapterCountEl, totalWordsEl, totalPagesEl;
let progressBar, progressFill;

// ============================================================
//  INIT
// ============================================================
function init() {
    // Load state
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

            // Populate fields if on settings page
            const titleEl = document.getElementById('bookTitle');
            if (titleEl) titleEl.value = data.bookTitle || 'My Wellness Book';
            const subtitleEl = document.getElementById('bookSubtitle');
            if (subtitleEl) subtitleEl.value = data.bookSubtitle || '';
            const authorEl = document.getElementById('bookAuthor');
            if (authorEl) authorEl.value = data.bookAuthor || 'Author Name';
            const isbnEl = document.getElementById('bookISBN');
            if (isbnEl) isbnEl.value = data.bookISBN || '';
            const publisherEl = document.getElementById('bookPublisher');
            if (publisherEl) publisherEl.value = data.bookPublisher || '';
            const editionEl = document.getElementById('bookEdition');
            if (editionEl) editionEl.value = data.bookEdition || '';
            const customSizeEl = document.getElementById('customSize');
            if (customSizeEl) customSizeEl.value = data.customSize || '6 x 9';
            const templateEl = document.getElementById('templateStyle');
            if (templateEl) templateEl.value = data.templateStyle || 'wellness';
            const fontEl = document.getElementById('fontFamily');
            if (fontEl) fontEl.value = data.fontFamily || 'serif';
            const copyrightEl = document.getElementById('copyrightText');
            if (copyrightEl) copyrightEl.value = data.copyrightText || 'Copyright © 2026 Author Name. All rights reserved.';

            if (coverData) {
                const cp = document.getElementById('coverPreview');
                if (cp) {
                    cp.style.display = 'block';
                    cp.innerHTML = `<img src="${coverData}" style="max-width:120px; border-radius:4px;">`;
                }
            }
            if (backCoverData) {
                const bcp = document.getElementById('backCoverPreview');
                if (bcp) {
                    bcp.style.display = 'block';
                    bcp.innerHTML = `<img src="${backCoverData}" style="max-width:120px; border-radius:4px;">`;
                }
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

    // Set up editor if on editor page
    chapterContent = document.getElementById('chapterContent');
    chapterSelector = document.getElementById('chapterSelector');
    tocList = document.getElementById('tocList');
    wordCountEl = document.getElementById('wordCount');
    charCountEl = document.getElementById('charCount');
    chapterCountEl = document.getElementById('chapterCount');
    totalWordsEl = document.getElementById('totalWords');
    totalPagesEl = document.getElementById('totalPages');
    progressBar = document.getElementById('progressBar');
    progressFill = document.getElementById('progressFill');

    if (chapterContent && chapterSelector) {
        if (currentChapterId) {
            loadChapter(currentChapterId);
        } else {
            currentChapterId = chapters[0].id;
            loadChapter(currentChapterId);
        }
        refreshTOC();
        updateStats();

        // Auto-save on changes
        chapterContent.addEventListener('input', () => {
            saveCurrentChapter();
            updateStats();
            refreshTOC();
            autoSave();
        });
    }

    // Auto-save on settings changes
    document.querySelectorAll('#bookTitle, #bookSubtitle, #bookAuthor, #bookISBN, #bookPublisher, #bookEdition, #templateStyle, #fontFamily, #customSize, #copyrightText').forEach(el => {
        if (el) el.addEventListener('change', autoSave);
    });

    // Page size toggle
    const pageSizeEl = document.getElementById('pageSize');
    if (pageSizeEl) {
        pageSizeEl.addEventListener('change', function() {
            const customGroup = document.getElementById('customSizeGroup');
            if (customGroup) customGroup.style.display = this.value === 'custom' ? 'block' : 'none';
        });
    }

    // Highlight selected layout
    document.querySelectorAll('.layout-card').forEach(card => {
        if (card) {
            card.classList.toggle('active', card.textContent.toLowerCase().includes(selectedLayout));
        }
    });

    // Check unlock status on export page
    if (document.getElementById('unlockOverlay')) {
        if (isUnlocked) {
            document.getElementById('unlockOverlay').style.display = 'none';
        }
    }
}

// ============================================================
//  CHAPTER MANAGEMENT
// ============================================================
function loadChapter(id) {
    const ch = chapters.find(c => c.id === id);
    if (!ch) return;
    if (chapterContent) chapterContent.value = ch.content;
    updateStats();
    if (chapterSelector) {
        chapterSelector.innerHTML = chapters.map(c =>
            `<option value="${c.id}" ${c.id === id ? 'selected' : ''}>${c.title}</option>`
        ).join('');
    }
}

function saveCurrentChapter() {
    const ch = chapters.find(c => c.id === currentChapterId);
    if (!ch) return;
    if (chapterSelector) {
        ch.title = chapterSelector.options[chapterSelector.selectedIndex]?.text || 'Untitled';
    }
    if (chapterContent) {
        ch.content = chapterContent.value;
    }
}

function addChapter() {
    saveCurrentChapter();
    const title = 'Chapter ' + (chapters.length + 1);
    const newCh = {
        id: 'ch' + (nextId++),
        title: title,
        content: ''
    };
    chapters.push(newCh);
    currentChapterId = newCh.id;
    loadChapter(currentChapterId);
    refreshTOC();
    autoSave();
    updateStats();
}

function deleteChapter() {
    if (chapters.length <= 1) {
        alert('You need at least one chapter.');
        return;
    }
    if (!confirm('Delete this chapter?')) return;
    const idx = chapters.findIndex(c => c.id === currentChapterId);
    chapters.splice(idx, 1);
    if (currentChapterId === chapters[0].id || idx >= chapters.length) {
        currentChapterId = chapters[0].id;
    }
    loadChapter(currentChapterId);
    refreshTOC();
    autoSave();
    updateStats();
}

// ============================================================
//  TOC
// ============================================================
function refreshTOC() {
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

        // Add fake subsections for demo
        const sub1 = document.createElement('li');
        sub1.className = 'level-2';
        sub1.textContent = 'Section ' + (index + 1) + '.1';
        tocList.appendChild(sub1);

        const sub2 = document.createElement('li');
        sub2.className = 'level-2';
        sub2.textContent = 'Section ' + (index + 1) + '.2';
        tocList.appendChild(sub2);
    });
    if (chapterCountEl) chapterCountEl.textContent = chapters.length;
}

// ============================================================
//  STATS
// ============================================================
function updateStats() {
    if (!chapterContent) return;
    const text = chapterContent.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (wordCountEl) wordCountEl.textContent = words + ' words';
    if (charCountEl) charCountEl.textContent = text.length + ' characters';

    const totalWords = chapters.reduce((sum, ch) => sum + (ch.content.trim() ? ch.content.trim().split(/\s+/).length : 0), 0);
    if (totalWordsEl) totalWordsEl.textContent = totalWords;
    if (totalPagesEl) totalPagesEl.textContent = Math.ceil(totalWords / 250);
    if (chapterCountEl) chapterCountEl.textContent = chapters.length;
}

// ============================================================
//  UPLOAD
// ============================================================
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const status = document.getElementById('uploadStatus');
    if (status) {
        status.className = 'upload-status';
        status.textContent = '⏳ Uploading and processing...';
    }

    if (progressBar) progressBar.style.display = 'block';
    if (progressFill) progressFill.style.width = '10%';

    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        if (typeof mammoth === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js';
            script.onload = function() {
                parseDocx(arrayBuffer);
            };
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
                        newChapters.push({
                            id: 'ch' + (nextId++),
                            title: currentTitle,
                            content: currentContent.join('\n')
                        });
                    }
                    currentTitle = line;
                    currentContent = [];
                } else if (line.length > 0) {
                    currentContent.push(line);
                }
            });

            if (currentContent.length > 0 || newChapters.length === 0) {
                newChapters.push({
                    id: 'ch' + (nextId++),
                    title: currentTitle,
                    content: currentContent.join('\n')
                });
            }

            if (newChapters.length > 0) {
                chapters = newChapters;
                currentChapterId = chapters[0].id;
                if (chapterContent) loadChapter(currentChapterId);
                refreshTOC();
                updateStats();
                autoSave();

                const status = document.getElementById('uploadStatus');
                if (status) {
                    status.className = 'upload-status success';
                    status.textContent = '✅ Success! Imported ' + chapters.length + ' chapters. Go to Editor to review.';
                }
            }

            if (progressFill) progressFill.style.width = '100%';
            setTimeout(() => {
                if (progressBar) progressBar.style.display = 'none';
                if (progressFill) progressFill.style.width = '0%';
            }, 1000);
        })
        .catch(function(err) {
            console.error('DOCX import error:', err);
            const status = document.getElementById('uploadStatus');
            if (status) {
                status.className = 'upload-status error';
                status.textContent = '❌ Error importing DOCX. Make sure it contains text.';
            }
            if (progressBar) progressBar.style.display = 'none';
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
        if (cp) {
            cp.style.display = 'block';
            cp.innerHTML = `<img src="${coverData}" style="max-width:120px; border-radius:4px;">`;
        }
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
        if (bcp) {
            bcp.style.display = 'block';
            bcp.innerHTML = `<img src="${backCoverData}" style="max-width:120px; border-radius:4px;">`;
        }
        autoSave();
    };
    reader.readAsDataURL(file);
}

// ============================================================
//  LAYOUT SELECTION
// ============================================================
function selectLayout(layout) {
    selectedLayout = layout;
    document.querySelectorAll('.layout-card').forEach(card => {
        if (card) {
            card.classList.toggle('active', card.textContent.toLowerCase().includes(layout));
        }
    });
    autoSave();
}

function updateTemplate() { autoSave(); }
function updateFont() { autoSave(); }

// ============================================================
//  EXPORT FUNCTIONS
// ============================================================

function handleExportClick(format) {
    if (!isUnlocked) {
        const overlay = document.getElementById('unlockOverlay');
        if (overlay) overlay.style.display = 'flex';
        return;
    }
    // Proceed with export
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
    showProgress();

    const title = document.getElementById('bookTitle')?.value || 'My Book';
    const author = document.getElementById('bookAuthor')?.value || 'Author Name';

    let content = '';
    chapters.forEach(ch => {
        content += `${ch.title}\n\n`;
        content += ch.content + '\n\n';
    });

    const docx = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
            ${chapters.map(ch => `
                <w:p><w:r><w:t>${ch.title}</w:t></w:r></w:p>
                ${ch.content.split('\n').filter(p => p.trim()).map(p => `
                    <w:p><w:r><w:t>${p}</w:t></w:r></w:p>
                `).join('')}
            `).join('')}
        </w:body>
    </w:document>`;

    const blob = new Blob([docx], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);

    hideProgress();
    showModal('DOCX exported successfully!', 'Export Complete');
}

function exportEPUB() {
    saveCurrentChapter();
    showProgress();

    const title = document.getElementById('bookTitle')?.value || 'My Book';
    const author = document.getElementById('bookAuthor')?.value || 'Author Name';
    const subtitle = document.getElementById('bookSubtitle')?.value || '';
    const isbn = document.getElementById('bookISBN')?.value || '';
    const publisher = document.getElementById('bookPublisher')?.value || '';
    const edition = document.getElementById('bookEdition')?.value || '';

    let chaptersHtml = '';
    chapters.forEach((ch, index) => {
        let content = ch.content;
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        content = content.replace(/__(.*?)__/g, '<u>$1</u>');
        content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        content = content.replace(/---/g, '<hr/>');

        chaptersHtml += `
            <h2>${ch.title}</h2>
            ${content.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('')}
            ${index < chapters.length - 1 ? '<hr style="page-break-before:always;"/>' : ''}
        `;
    });

    const fullHtml = `<!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
            body { max-width: 6in; margin: 1in auto; font-family: Georgia, serif; line-height: 1.6; }
            h1 { text-align: center; margin: 2em 0; }
            h2 { text-align: center; margin: 1.5em 0; }
            p { text-indent: 1.5em; margin-bottom: 0.5em; }
            hr { border: none; border-top: 1px solid #ccc; margin: 2em 0; }
            ${coverData ? `.cover { text-align: center; margin: 2em 0; }` : ''}
        </style>
    </head>
    <body>
        ${coverData ? `<div class="cover"><img src="${coverData}" style="max-width:100%;"/></div>` : ''}
        <h1>${title}</h1>
        ${subtitle ? `<p style="text-indent:0; text-align:center;">${subtitle}</p>` : ''}
        <p style="text-indent:0; text-align:center;">By ${author}</p>
        ${isbn ? `<p style="text-indent:0; text-align:center;">ISBN: ${isbn}</p>` : ''}
        ${publisher ? `<p style="text-indent:0; text-align:center;">${publisher}</p>` : ''}
        ${edition ? `<p style="text-indent:0; text-align:center;">${edition}</p>` : ''}
        <hr/>
        ${chaptersHtml}
    </body>
    </html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);

    hideProgress();
    showModal('EPUB exported as HTML. Convert to EPUB using Calibre (free) for professional quality.', 'Export Complete');
}

function exportPDF() {
    saveCurrentChapter();
    showProgress();

    const title = document.getElementById('bookTitle')?.value || 'My Book';
    const author = document.getElementById('bookAuthor')?.value || 'Author Name';
    const subtitle = document.getElementById('bookSubtitle')?.value || '';
    const isbn = document.getElementById('bookISBN')?.value || '';
    const publisher = document.getElementById('bookPublisher')?.value || '';
    const edition = document.getElementById('bookEdition')?.value || '';
    const copyrightText = document.getElementById('copyrightText')?.value || 'Copyright © 2026 Author Name. All rights reserved.';

    let sizeCSS = '6in 9in';
    if (selectedLayout === 'digest') sizeCSS = '5.5in 8.5in';
    else if (selectedLayout === 'letter') sizeCSS = '8.5in 11in';
    else if (selectedLayout === 'a4') sizeCSS = '210mm 297mm';
    else if (selectedLayout === 'a5') sizeCSS = '148mm 210mm';
    else if (selectedLayout === 'custom') {
        const custom = document.getElementById('customSize')?.value || '6 x 9';
        const parts = custom.split(/x|×/).map(s => s.trim());
        if (parts.length === 2) {
            sizeCSS = `${parts[0]}in ${parts[1]}in`;
        }
    }

    let chaptersHtml = '';
    chapters.forEach((ch, index) => {
        let content = ch.content;
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        content = content.replace(/__(.*?)__/g, '<u>$1</u>');
        content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        content = content.replace(/---/g, '<hr/>');

        chaptersHtml += `
            <h2>${ch.title}</h2>
            ${content.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('')}
            ${index < chapters.length - 1 ? '<div style="page-break-after:always;"></div>' : ''}
        `;
    });

    const printHtml = `<!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
            @page {
                size: ${sizeCSS};
                margin: 0.75in 0.5in 0.75in 0.75in;
            }
            body {
                font-family: Georgia, serif;
                line-height: 1.6;
                font-size: 11pt;
            }
            h1 {
                text-align: center;
                margin: 2em 0;
                page-break-before: always;
            }
            h2 {
                text-align: center;
                margin: 1.5em 0;
            }
            p {
                text-indent: 1.5em;
                margin-bottom: 0.5em;
            }
            hr { border: none; border-top: 1px solid #ccc; margin: 2em 0; }
            .title-page {
                text-align: center;
                page-break-after: always;
            }
            .title-page h1 {
                font-size: 24pt;
                margin-top: 4em;
            }
            .title-page p {
                text-indent: 0;
                margin-top: 2em;
            }
            .copyright {
                text-align: center;
                font-size: 9pt;
                page-break-after: always;
            }
            ${coverData ? `.cover-page { page-break-after: always; text-align: center; }` : ''}
            ${backCoverData ? `.back-cover { page-break-before: always; text-align: center; }` : ''}
        </style>
    </head>
    <body>
        ${coverData ? `<div class="cover-page"><img src="${coverData}" style="max-width:100%;"/></div>` : ''}
        <div class="title-page">
            <h1>${title}</h1>
            ${subtitle ? `<p style="text-indent:0; text-align:center;">${subtitle}</p>` : ''}
            <p>By ${author}</p>
            ${publisher ? `<p>${publisher}</p>` : ''}
            ${edition ? `<p>${edition}</p>` : ''}
            <p style="margin-top:4em;">${new Date().getFullYear()}</p>
        </div>
        <div class="copyright">
            ${copyrightText.split('\n').map(line => `<p>${line}</p>`).join('')}
            ${isbn ? `<p>ISBN: ${isbn}</p>` : ''}
        </div>
        ${chaptersHtml}
        ${backCoverData ? `<div class="back-cover"><img src="${backCoverData}" style="max-width:100%;"/></div>` : ''}
    </body>
    </html>`;

    const win = window.open('', '_blank');
    win.document.write(printHtml);
    win.document.close();

    setTimeout(() => {
        win.print();
        hideProgress();
    }, 500);

    showModal('PDF export: Use "Save as PDF" in the print dialog.', 'PDF Export');
}

function exportHTML() {
    saveCurrentChapter();

    const title = document.getElementById('bookTitle')?.value || 'My Book';
    const author = document.getElementById('bookAuthor')?.value || 'Author Name';
    const subtitle = document.getElementById('bookSubtitle')?.value || '';
    const isbn = document.getElementById('bookISBN')?.value || '';
    const publisher = document.getElementById('bookPublisher')?.value || '';

    let chaptersHtml = '';
    chapters.forEach(ch => {
        let content = ch.content;
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        content = content.replace(/__(.*?)__/g, '<u>$1</u>');
        content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        content = content.replace(/---/g, '<hr/>');

        chaptersHtml += `
            <h2>${ch.title}</h2>
            ${content.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('')}
        `;
    });

    const html = `<!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
            body { max-width: 6in; margin: 1in auto; font-family: Georgia, serif; line-height: 1.6; }
            h1 { text-align: center; margin: 2em 0; }
            h2 { text-align: center; margin: 1.5em 0; }
            p { text-indent: 1.5em; margin-bottom: 0.5em; }
            hr { border: none; border-top: 1px solid #ccc; margin: 2em 0; }
            ${coverData ? `.cover { text-align: center; margin: 2em 0; }` : ''}
        </style>
    </head>
    <body>
        ${coverData ? `<div class="cover"><img src="${coverData}" style="max-width:100%;"/></div>` : ''}
        <h1>${title}</h1>
        ${subtitle ? `<p style="text-indent:0; text-align:center;">${subtitle}</p>` : ''}
        <p style="text-indent:0; text-align:center;">By ${author}</p>
        ${isbn ? `<p style="text-indent:0; text-align:center;">ISBN: ${isbn}</p>` : ''}
        ${publisher ? `<p style="text-indent:0; text-align:center;">${publisher}</p>` : ''}
        <hr/>
        ${chaptersHtml}
    </body>
    </html>`;

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

    const title = document.getElementById('bookTitle')?.value || 'My Book';
    const author = document.getElementById('bookAuthor')?.value || 'Author Name';

    let txt = `${title}\nBy ${author}\n\n`;
    chapters.forEach(ch => {
        txt += `\n\n${ch.title}\n\n`;
        txt += ch.content + '\n\n';
    });

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
    showProgress();
    exportDOCX();
    setTimeout(() => {
        exportEPUB();
        setTimeout(() => {
            exportPDF();
            setTimeout(() => {
                exportHTML();
                setTimeout(() => {
                    exportTXT();
                    hideProgress();
                    showModal('All formats exported! Check your downloads folder.', 'Export Complete');
                }, 500);
            }, 500);
        }, 500);
    }, 500);
}

// ============================================================
//  UNLOCK SYSTEM
// ============================================================
function verifyCode() {
    const input = document.getElementById('unlockCodeInput');
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    // Check against stored valid codes
    const validCodes = JSON.parse(localStorage.getItem('ritemasta_valid_codes') || '[]');
    if (validCodes.includes(code)) {
        isUnlocked = true;
        autoSave();
        document.getElementById('unlockOverlay').style.display = 'none';
        showModal('✅ Unlocked! You can now export all formats.', 'Unlock Successful');
    } else {
        showModal('❌ Invalid code. Please check and try again, or email ritemasta@proton.me for assistance.', 'Invalid Code');
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
        chapters: chapters,
        currentChapterId: currentChapterId,
        nextId: nextId,
        coverData: coverData,
        backCoverData: backCoverData,
        selectedLayout: selectedLayout,
        isUnlocked: isUnlocked,
        bookTitle: document.getElementById('bookTitle')?.value || '',
        bookSubtitle: document.getElementById('bookSubtitle')?.value || '',
        bookAuthor: document.getElementById('bookAuthor')?.value || '',
        bookISBN: document.getElementById('bookISBN')?.value || '',
        bookPublisher: document.getElementById('bookPublisher')?.value || '',
        bookEdition: document.getElementById('bookEdition')?.value || '',
        customSize: document.getElementById('customSize')?.value || '',
        templateStyle: document.getElementById('templateStyle')?.value || '',
        fontFamily: document.getElementById('fontFamily')?.value || '',
        copyrightText: document.getElementById('copyrightText')?.value || ''
    };
    localStorage.setItem('ritemasta_pro_project', JSON.stringify(data));
}

function saveProject() {
    autoSave();
    showModal('Project saved to your browser!', 'Save Complete');
}

// ============================================================
//  UTILITY
// ============================================================
function showProgress() {
    if (progressBar) progressBar.style.display = 'block';
    if (progressFill) progressFill.style.width = '50%';
}

function hideProgress() {
    if (progressFill) progressFill.style.width = '100%';
    setTimeout(() => {
        if (progressBar) progressBar.style.display = 'none';
        if (progressFill) progressFill.style.width = '0%';
    }, 500);
}

function showModal(message, title = 'Export Complete') {
    const modal = document.getElementById('exportModal');
    if (!modal) {
        alert(message);
        return;
    }
    const titleEl = document.getElementById('modalTitle');
    const msgEl = document.getElementById('modalMessage');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    modal.classList.add('open');
}

function closeModal() {
    const modal = document.getElementById('exportModal');
    if (modal) modal.classList.remove('open');
}

// ============================================================
//  START
// ============================================================
document.addEventListener('DOMContentLoaded', init);
