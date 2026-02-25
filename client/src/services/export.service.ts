import { jsPDF } from 'jspdf';
import type { ParsedSceneData } from '../types/scene.types';

export async function exportStoryboardPDF(
    canvasId: string,
    sceneDataList: ParsedSceneData[],
    projectName: string = 'Cinematic Pre-Vis'
): Promise<void> {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
        throw new Error('Could not find the 3D canvas element for export.');
    }

    // 1. Capture the immediate WebGL drawing buffer
    // Note: the R3F Canvas must have gl={{ preserveDrawingBuffer: true }}
    const frameDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // 2. Initialize the PDF document (Landscape orientation)
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Removed unused pageWidth and pageHeight variables

    let isFirstPage = true;

    // In a real app we would loop through multiple scenes and capture multiple frames.
    // For this component, we'll demonstrate it with the current active scene canvas.
    for (const scene of sceneDataList) {
        if (!isFirstPage) doc.addPage();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(`Scene ${scene.sceneNumber}: ${scene.heading}`, 15, 20);

        // The Snapshot Image
        // A4 landscape width is 297mm. We'll map the canvas aspect ratio (usually 16:9 or similar)
        const imgWidth = 160;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;

        doc.addImage(frameDataUrl, 'JPEG', 15, 30, imgWidth, imgHeight);

        // Sidebar Information
        const sidebarX = 15 + imgWidth + 10;
        let currentY = 30;

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Camera & Lighting Details', sidebarX, currentY);

        currentY += 8;
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);

        const activeCam = scene.cameraSuggestions[0] || { shotType: 'Default', angle: 'N/A', focalLength: 'N/A' };

        doc.text(`Shot Type: ${activeCam.shotType}`, sidebarX, currentY); currentY += 6;
        doc.text(`Camera Angle: ${activeCam.angle}`, sidebarX, currentY); currentY += 6;
        doc.text(`Lens: ${activeCam.focalLength}mm`, sidebarX, currentY); currentY += 6;

        currentY += 4;
        doc.text(`Time of Day: ${scene.lighting.timeOfDay}`, sidebarX, currentY); currentY += 6;
        doc.text(`Mood: ${scene.lighting.mood}`, sidebarX, currentY); currentY += 6;

        // Characters
        currentY += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Characters in Frame', sidebarX, currentY); currentY += 6;

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        if (scene.characters && scene.characters.length > 0) {
            scene.characters.forEach(c => {
                doc.text(`- ${c.name}`, sidebarX, currentY);
                currentY += 5;
            });
        } else {
            doc.text('None', sidebarX, currentY);
        }

        isFirstPage = false;
    }

    // Generate and Prompt Download
    doc.save(`${projectName.replace(/\s+/g, '_')}_Storyboard.pdf`);
}

export function exportShotListCSV(sceneDataList: ParsedSceneData[], projectName: string = 'Cinematic Pre-Vis'): void {
    // 1. Create CSV header
    const headers = ['Scene', 'Heading', 'Time of Day', 'Mood', 'Shot Type', 'Camera Angle', 'Lens (mm)', 'Characters', 'Props'];
    const rows: string[][] = [headers];

    // 2. Iterate through scenes and extract metadata
    for (const scene of sceneDataList) {
        const activeCam = scene.cameraSuggestions[0] || { shotType: 'Default', angle: 'N/A', focalLength: 'N/A' };

        const characters = scene.characters ? scene.characters.map(c => c.name).join(' | ') : 'None';
        const props = scene.props ? scene.props.map(p => p.type).join(' | ') : 'None';

        const row = [
            scene.sceneNumber.toString(),
            `"${scene.heading.replace(/"/g, '""')}"`, // Escape quotes for CSV
            scene.lighting.timeOfDay,
            scene.lighting.mood,
            activeCam.shotType,
            activeCam.angle,
            activeCam.focalLength.toString(),
            `"${characters.replace(/"/g, '""')}"`,
            `"${props.replace(/"/g, '""')}"`
        ];

        rows.push(row);
    }

    // 3. Convert to CSV string format
    const csvContent = rows.map(r => r.join(',')).join('\n');

    // 4. Trigger file download via Blob and Object URL
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Fallback for browsers that don't support HTML5 download
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${projectName.replace(/\s+/g, '_')}_ShotList.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
