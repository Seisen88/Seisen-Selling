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
  const getPreparedData = () => {
    // Sort A-Z by file name
    const sortedFiles = [...files].sort((a, b) => 
      a.file_name.localeCompare(b.file_name)
    );
    
    // As per user request, only include the game names to keep it clean and easy
    return sortedFiles.map((file, index) => ({
      "#": index + 1,
      "Game Name": file.file_name,
    }));
  };

  const exportAsExcel = () => {
    const data = getPreparedData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Games");
    XLSX.writeFile(workbook, "Games_List.xlsx");
    setIsOpen(false);
  };

  const exportAsTXT = () => {
    const data = getPreparedData();
    let textContent = "GAMES LIST (A-Z)\n=================\n\n";
    data.forEach(row => {
      textContent += `${row["#"]}. ${row["Game Name"]}\n`;
    });

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Games_List.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const exportAsPDF = async () => {
    // Dynamically import to prevent Next.js SSR build errors
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const data = getPreparedData();
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Games List", 14, 22);
    
    const tableColumn = ["#", "Game Name"];
    const tableRows = data.map(item => [item["#"], item["Game Name"]]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237] }, // Purple-600
    });

    doc.save("Games_List.pdf");
    setIsOpen(false);
  };

  const exportAsWord = () => {
    const data = getPreparedData();
    let htmlContext = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Games List</title>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { color: #333; text-align: center; }
          ul { list-style-type: none; padding: 0; }
          li { padding: 4px 0; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <h1>Games List (A-Z)</h1>
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
    link.download = 'Games_List.doc';
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
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-purple-500/20 whitespace-nowrap border border-purple-500/50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Export ▾
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#14142a] border border-[#2a2a4a] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col z-50">
          <button
            onClick={exportAsExcel}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-purple-500/10 hover:text-purple-300 transition-colors text-left"
          >
            📗 Excel (.xlsx)
          </button>
          <button
            onClick={exportAsTXT}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-purple-500/10 hover:text-purple-300 transition-colors text-left"
          >
            📝 Note (.txt)
          </button>
          <button
            onClick={exportAsWord}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-purple-500/10 hover:text-purple-300 transition-colors text-left"
          >
            📘 Word (.doc)
          </button>
          <button
            onClick={exportAsPDF}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-purple-500/10 hover:text-purple-300 transition-colors text-left"
          >
            📕 PDF (.pdf)
          </button>
        </div>
      )}
    </div>
  );
}
