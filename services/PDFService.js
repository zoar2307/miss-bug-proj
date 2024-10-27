import axios from 'axios';
import { query } from 'express';
import fs from 'fs'
import PDFDocument from 'pdfkit'

export function createPdf(path, bugs) {
    const doc = new PDFDocument({ size: 'A4' });
    doc.pipe(fs.createWriteStream(path));

    bugs.forEach(bug => {
        doc.text(`Bug ID: ${bug._id}`)
        doc.text(`Bug: ${bug.title}`)
        doc.text(`Description: ${bug.description}`)
        doc.text(`Severity: ${bug.severity}`)
    })
    doc.end();
}
