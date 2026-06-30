-- Script de criação das tabelas para o Módulo de Folha de Pagamento

-- 1. Tabela de Escalas de Trabalho
CREATE TABLE IF NOT EXISTS public.work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    consider_holidays_as_workdays BOOLEAN DEFAULT false,
    
    -- Dias trabalhados
    work_monday BOOLEAN DEFAULT true,
    work_tuesday BOOLEAN DEFAULT true,
    work_wednesday BOOLEAN DEFAULT true,
    work_thursday BOOLEAN DEFAULT true,
    work_friday BOOLEAN DEFAULT true,
    work_saturday BOOLEAN DEFAULT false,
    work_sunday BOOLEAN DEFAULT false,
    
    start_time TIME DEFAULT '08:00:00',
    end_time TIME DEFAULT '18:00:00',
    break_duration INTEGER DEFAULT 60, -- em minutos
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Registros de Frequência
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restrição para garantir que não haja registros duplicados do mesmo dia para a mesma pessoa
    UNIQUE(employee_id, date)
);

-- 3. Atualização da tabela de Funcionários (team_members)
-- Adiciona os campos de folha, caso ainda não existam.
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES public.work_schedules(id);
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS base_salary NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS bonus NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS cesta_basica NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS lunch_allowance NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS breakfast_allowance NUMERIC(10, 2) DEFAULT 0;

-- 4. Permissões de Segurança (RLS - Row Level Security)
-- (Simplificando para permitir acesso autenticado neste primeiro momento)

ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de work_schedules para autenticados" 
ON public.work_schedules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir todas as operações em work_schedules para autenticados" 
ON public.work_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura de attendance_records para autenticados" 
ON public.attendance_records FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir todas as operações em attendance_records para autenticados" 
ON public.attendance_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
