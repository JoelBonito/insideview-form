-- Criar schema insideview
CREATE SCHEMA IF NOT EXISTS insideview;

-- Tabela de agências
CREATE TABLE insideview.agencias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de visitas
CREATE TABLE insideview.visitas (
    id SERIAL PRIMARY KEY,
    agencia VARCHAR(255) NOT NULL,
    servico VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) DEFAULT 0,
    data DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('realizada', 'pendente', 'cancelada', 'em_andamento')),
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir agências iniciais
INSERT INTO insideview.agencias (nome, ativo) VALUES
    ('Agência Exemplo 1', true),
    ('Agência Exemplo 2', true),
    ('Agência Exemplo 3', true),
    ('Imobiliária Centro', true),
    ('Imobiliária Zona Sul', true);

-- Habilitar RLS (Row Level Security) - para produção
ALTER TABLE insideview.agencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE insideview.visitas ENABLE ROW LEVEL SECURITY;

-- Política pública para leitura (temporária - ajustar para produção)
CREATE POLICY "Permitir leitura pública de agencias" ON insideview.agencias FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública de agencias" ON insideview.agencias FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública de agencias" ON insideview.agencias FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura pública de visitas" ON insideview.visitas FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública de visitas" ON insideview.visitas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública de visitas" ON insideview.visitas FOR UPDATE USING (true);
CREATE POLICY "Permitir deleção pública de visitas" ON insideview.visitas FOR DELETE USING (true);
