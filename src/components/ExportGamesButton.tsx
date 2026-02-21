"use client";

import { useState, useRef, useEffect } from "react";
import type { FileRecord } from "@/lib/types";
import * as XLSX from "xlsx";

interface ExportGamesButtonProps {
  files: FileRecord[];
}

export default function ExportGamesButton({ files }: ExportGamesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prepares the sorted game list data
  const getPreparedData = (onlyRecent = false) => {
    let filtered = [...files];

    if (onlyRecent) {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      filtered = filtered.filter((f) => new Date(f.upload_date) >= twoDaysAgo);
    }

    // Sort A-Z by file name
    filtered.sort((a, b) => a.file_name.localeCompare(b.file_name));

    return filtered.map((file, index) => ({
      "#": index + 1,
      "Game Name": file.file_name,
    }));
  };

  const exportAsExcel = (onlyRecent = false) => {
    const data = getPreparedData(onlyRecent);
    if (onlyRecent && data.length === 0) { alert("No games added in the last 2 days."); return; }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Games");
    XLSX.writeFile(workbook, onlyRecent ? "Games_Last_2_Days.xlsx" : "Games_List.xlsx");
    setIsOpen(false);
  };

  const exportAsTXT = (onlyRecent = false) => {
    const data = getPreparedData(onlyRecent);
    if (onlyRecent && data.length === 0) { alert("No games added in the last 2 days."); return; }
    const title = onlyRecent ? "GAMES ADDED (LAST 2 DAYS)" : "GAMES LIST (A-Z)";
    let textContent = `${title}\n${'='.repeat(title.length)}\n\n`;
    data.forEach(row => {
      textContent += `${row["#"]}. ${row["Game Name"]}\n`;
    });

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", onlyRecent ? "Games_Last_2_Days.txt" : "Games_List.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const exportAsPDF = async (onlyRecent = false) => {
    const data = getPreparedData(onlyRecent);
    if (onlyRecent && data.length === 0) { alert("No games added in the last 2 days."); return; }
    // Dynamically import to prevent Next.js SSR build errors
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    const title = onlyRecent ? "Games Added (Last 2 Days)" : "Games List";
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    const tableColumn = ["#", "Game Name"];
    const tableRows = data.map(item => [item["#"], item["Game Name"]]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] }, // White header
    });

    doc.save(onlyRecent ? "Games_Last_2_Days.pdf" : "Games_List.pdf");
    setIsOpen(false);
  };

  const exportAsWord = (onlyRecent = false) => {
    const data = getPreparedData(onlyRecent);
    if (onlyRecent && data.length === 0) { alert("No games added in the last 2 days."); return; }
    const title = onlyRecent ? "Games Added (Last 2 Days)" : "Games List (A-Z)";
    let htmlContext = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { color: #333; text-align: center; }
          ul { list-style-type: none; padding: 0; }
          li { padding: 4px 0; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <ul>
    `;
    
    data.forEach(row => {
      htmlContext += `<li><strong>${row["#"]}.</strong> ${escapeHTML(row["Game Name"])}</li>`;
    });
    
    htmlContext += `
        </ul>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContext], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = onlyRecent ? 'Games_Last_2_Days.doc' : 'Games_List.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const escapeHTML = (str: string) => {
    return str.replace(/[&<>'"]/g, 
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag as string] || tag)
    );
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-white/10 whitespace-nowrap border border-white/50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Export ▾
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#161616] border border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col z-50">
          {/* All Games Section */}
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">All Games</p>
          </div>
          <button
            onClick={() => exportAsExcel()}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors text-left"
          >
            Excel (.xlsx)
          </button>
          <button
            onClick={() => exportAsTXT()}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors text-left"
          >
            Note (.txt)
          </button>
          <button
            onClick={() => exportAsWord()}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors text-left"
          >
            Word (.doc)
          </button>
          <button
            onClick={() => exportAsPDF()}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors text-left"
          >
            PDF (.pdf)
          </button>

          {/* Divider */}
          <div className="mx-3 my-1 border-t border-[#2a2a2a]" />

          {/* Last 2 Days Section */}
          <div className="px-3 pt-1.5 pb-1">
            <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Last 2 Days</p>
          </div>
          <button
            onClick={() => exportAsExcel(true)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 transition-colors text-left cursor-pointer"
            style={{ ['--tw-bg' as string]: 'rgba(16,185,129,0.1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#6ee7b7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
          >
            Excel (.xlsx)
          </button>
          <button
            onClick={() => exportAsTXT(true)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 transition-colors text-left cursor-pointer"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#6ee7b7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
          >
            Note (.txt)
          </button>
          <button
            onClick={() => exportAsWord(true)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 transition-colors text-left cursor-pointer"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#6ee7b7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
          >
            Word (.doc)
          </button>
          <button
            onClick={() => exportAsPDF(true)}
            className="flex items-center gap-3 px-4 py-2 pb-2.5 text-sm text-gray-200 transition-colors text-left cursor-pointer"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#6ee7b7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
          >
            PDF (.pdf)
          </button>
        </div>
      )}
    </div>
  );
}
