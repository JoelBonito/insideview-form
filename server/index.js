import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, '../database');
const VISITAS_FILE = path.join(DB_PATH, 'visitas.csv');
const CONFIG_FILE = path.join(DB_PATH, 'config.csv');

// Helper: Parse CSV
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',');
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            data.push(obj);
        }
    }

    return data;
}

// Helper: Convert to CSV
function toCSV(data, headers) {
    const rows = [headers.join(',')];
    data.forEach(item => {
        const values = headers.map(h => item[h] || '');
        rows.push(values.join(','));
    });
    return rows.join('\n');
}

// GET /api/agencies
app.get('/api/agencies', async (req, res) => {
    try {
        const csvText = await fs.readFile(CONFIG_FILE, 'utf-8');
        const agencies = parseCSV(csvText).filter(a => a.ativo === 'true');
        res.json(agencies);
    } catch (error) {
        console.error('Erro ao ler agências:', error);
        res.status(500).json({ error: 'Erro ao buscar agências' });
    }
});

// GET /api/visits
app.get('/api/visits', async (req, res) => {
    try {
        const csvText = await fs.readFile(VISITAS_FILE, 'utf-8');
        const visits = parseCSV(csvText);
        res.json(visits);
    } catch (error) {
        console.error('Erro ao ler visitas:', error);
        res.status(500).json({ error: 'Erro ao buscar visitas' });
    }
});

// POST /api/visits
app.post('/api/visits', async (req, res) => {
    try {
        const newVisit = req.body;
        newVisit.id = Date.now().toString();
        newVisit.criado_em = new Date().toISOString();
        newVisit.atualizado_em = new Date().toISOString();

        const csvText = await fs.readFile(VISITAS_FILE, 'utf-8');
        const visits = parseCSV(csvText);
        visits.push(newVisit);

        const headers = ['id', 'agencia', 'servico', 'valor', 'data', 'status', 'observacoes', 'criado_em', 'atualizado_em'];
        const newCSV = toCSV(visits, headers);
        await fs.writeFile(VISITAS_FILE, newCSV);

        res.json({ success: true, id: newVisit.id });
    } catch (error) {
        console.error('Erro ao salvar visita:', error);
        res.status(500).json({ error: 'Erro ao salvar visita' });
    }
});

// PUT /api/visits/:id
app.put('/api/visits/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedVisit = req.body;
        updatedVisit.atualizado_em = new Date().toISOString();

        const csvText = await fs.readFile(VISITAS_FILE, 'utf-8');
        const visits = parseCSV(csvText);
        const index = visits.findIndex(v => v.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Visita não encontrada' });
        }

        visits[index] = { ...visits[index], ...updatedVisit };

        const headers = ['id', 'agencia', 'servico', 'valor', 'data', 'status', 'observacoes', 'criado_em', 'atualizado_em'];
        const newCSV = toCSV(visits, headers);
        await fs.writeFile(VISITAS_FILE, newCSV);

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar visita:', error);
        res.status(500).json({ error: 'Erro ao atualizar visita' });
    }
});

// GET /api/visits/export
app.get('/api/visits/export', async (req, res) => {
    try {
        const { agencyId, startDate, endDate } = req.query;
        const csvText = await fs.readFile(VISITAS_FILE, 'utf-8');
        let visits = parseCSV(csvText);

        // Filtrar por agência
        if (agencyId && agencyId !== 'all') {
            visits = visits.filter(v => v.agencia === agencyId);
        }

        // Filtrar por data
        if (startDate && endDate) {
            visits = visits.filter(v => {
                const visitDate = new Date(v.data);
                return visitDate >= new Date(startDate) && visitDate <= new Date(endDate);
            });
        }

        res.json(visits);
    } catch (error) {
        console.error('Erro ao exportar visitas:', error);
        res.status(500).json({ error: 'Erro ao exportar visitas' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
