import { useNoteStore } from '@/composables/useNoteStore';
import { useToast } from '@/composables/useToast';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function useExport() {
  const { activeNote } = useNoteStore();
  const { showToast } = useToast();

  const getFileName = (ext: string, defaultName?: string) => {
    const title = defaultName || activeNote.value?.title || 'Untitled';
    // Remove invalid filename characters
    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_');
    return `${safeTitle}.${ext}`;
  };

  const saveFile = async (blob: Blob, fileName: string, extension: 'md' | 'pdf') => {
    try {
      // @ts-ignore - File System Access API
      if (window.showSaveFilePicker) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: extension === 'md' ? 'Markdown File' : 'PDF File',
            accept: {
              [extension === 'md' ? 'text/markdown' : 'application/pdf']: [`.${extension}`],
            },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return false; // User cancelled
      }
      // Fallback to saveAs if API fails or not supported
      console.warn('File System Access API not supported or failed, falling back to saveAs', err);
    }

    // Fallback
    saveAs(blob, fileName);
    return true;
  };

  const exportMarkdown = async () => {
    if (!activeNote.value) {
      showToast('未选择笔记', 'error');
      return;
    }
    
    const fileName = getFileName('md');

    try {
      const blob = new Blob([activeNote.value.content], { type: 'text/markdown;charset=utf-8' });
      const success = await saveFile(blob, fileName, 'md');
      if (success) {
        showToast('Markdown 导出成功', 'success');
      }
    } catch (e) {
      console.error(e);
      showToast('Markdown 导出失败', 'error');
    }
  };

  const exportPDF = async () => {
    if (!activeNote.value) {
      showToast('未选择笔记', 'error');
      return;
    }

    const originalElement = document.querySelector('.markdown-body') as HTMLElement;
    if (!originalElement) {
      showToast('无法获取预览内容', 'error');
      return;
    }

    try {
      showToast('正在生成 PDF...', 'info');

      // Create a temporary container to fix width for A4 consistency
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '-9999px';
      container.style.width = '794px'; // A4 width at 96 DPI
      // Copy background color to ensure dark mode consistency
      container.style.backgroundColor = '#111827'; 
      container.style.color = '#d1d5db'; // text-gray-300
      
      // Clone the content
      const clonedContent = originalElement.cloneNode(true) as HTMLElement;
      // Ensure the cloned content takes full width of container
      clonedContent.style.width = '100%';
      clonedContent.style.maxWidth = 'none';
      clonedContent.style.padding = '40px'; // Add some padding
      
      container.appendChild(clonedContent);
      document.body.appendChild(container);

      // Wait for images to load in the cloned element if any (optional, but good practice)
      // For now, assume images are already loaded in original and cloneNode copies that state usually.
      
      // Use html2canvas to capture the rendered markdown
      const canvas = await html2canvas(container, {
        scale: 2, // Improve resolution
        useCORS: true,
        backgroundColor: '#111827', // Match the dark theme background (gray-900)
        logging: false,
        windowWidth: 794, 
        windowHeight: container.scrollHeight
      });

      // Cleanup
      document.body.removeChild(container);

      const contentWidth = canvas.width;
      const contentHeight = canvas.height;

      // A4 dimensions in pt
      const pageHeight = 841.89;
      const pageWidth = 595.28;

      // Calculate the image dimensions to fit within A4 width
      const margin = 20;
      const pdfImageWidth = pageWidth - (margin * 2);
      const pdfImageHeight = (pdfImageWidth / contentWidth) * contentHeight;

      const pdf = new jsPDF('p', 'pt', 'a4');
      
      let heightLeft = pdfImageHeight;
      let position = 0;

      // First page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, pdfImageWidth, pdfImageHeight);
      heightLeft -= (pageHeight - (margin * 2));
      position -= (pageHeight - (margin * 2)); 

      // Subsequent pages
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin + position, pdfImageWidth, pdfImageHeight);
        heightLeft -= (pageHeight - (margin * 2));
        position -= (pageHeight - (margin * 2));
      }

      const fileName = getFileName('pdf');
      const pdfBlob = pdf.output('blob');
      
      const success = await saveFile(pdfBlob, fileName, 'pdf');
      if (success) {
        showToast('PDF 导出成功', 'success');
      }
    } catch (e) {
      console.error(e);
      showToast('PDF 导出失败', 'error');
    }
  };

  return {
    exportPDF,
    exportMarkdown
  };
}
