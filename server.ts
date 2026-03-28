import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'client'
  );

  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    industry TEXT,
    size TEXT
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    text TEXT,
    weight INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    user_id INTEGER,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'draft',
    FOREIGN KEY(company_id) REFERENCES companies(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id INTEGER,
    question_id INTEGER,
    score INTEGER,
    comments TEXT,
    FOREIGN KEY(assessment_id) REFERENCES assessments(id),
    FOREIGN KEY(question_id) REFERENCES questions(id)
  );
`);

// Seed Questions if empty
const questionCount = db.prepare("SELECT COUNT(*) as count FROM questions").get() as { count: number };
if (questionCount.count === 0) {
  const insertQ = db.prepare("INSERT INTO questions (category, text, weight) VALUES (?, ?, ?)");
  const seedQs = [
    // Informar (Visibilidade e Alocação)
    ["Informar", "Existe uma política de Tags/Labels obrigatória para todos os recursos criados?", 1],
    ["Informar", "Os custos de cloud são alocados para centros de custo ou unidades de negócio específicos?", 1],
    ["Informar", "A empresa possui dashboards de visibilidade de custos acessíveis às equipes técnicas?", 1],
    ["Informar", "Há um processo de revisão mensal de faturas e variações de custo?", 1],
    
    // Otimizar (Otimização de Recursos)
    ["Otimizar", "São utilizadas instâncias reservadas ou Savings Plans para workloads estáveis?", 1],
    ["Otimizar", "Existe um processo automatizado para desligar ambientes de desenvolvimento/homologação fora do horário comercial?", 1],
    ["Otimizar", "A empresa realiza o 'rightsizing' (ajuste de tamanho) de instâncias e volumes de storage regularmente?", 1],
    ["Otimizar", "São utilizadas instâncias Spot para workloads tolerantes a falhas?", 1],

    // Operar (Governança e Cultura)
    ["Operar", "Os desenvolvedores têm visibilidade em tempo real do custo das aplicações que sustentam?", 1],
    ["Operar", "Existem orçamentos (budgets) definidos com alertas automáticos de estouro?", 1],
    ["Operar", "A cultura de FinOps está integrada ao ciclo de vida de desenvolvimento (DevSecOps)?", 1],
    ["Operar", "Há uma equipe ou comitê dedicado à governança de custos de cloud?", 1]
  ];
  seedQs.forEach(q => insertQ.run(q[0], q[1], q[2]));
}

// Seed Admin User if empty
const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
if (adminCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run("admin@example.com", hashedPassword, "admin");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post("/api/auth/register", (req, res) => {
    const { email, password, role } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run(email, hashedPassword, role || 'client');
      res.json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/companies", authenticateToken, (req, res) => {
    const companies = db.prepare("SELECT * FROM companies").all();
    res.json(companies);
  });

  app.post("/api/companies", authenticateToken, (req, res) => {
    const { name, industry, size } = req.body;
    const result = db.prepare("INSERT INTO companies (name, industry, size) VALUES (?, ?, ?)").run(name, industry, size);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/questions", authenticateToken, (req, res) => {
    const questions = db.prepare("SELECT * FROM questions").all();
    res.json(questions);
  });

  app.post("/api/assessments", authenticateToken, (req, res: any) => {
    const { company_id } = req.body;
    const user_id = (req as any).user.id;
    const result = db.prepare("INSERT INTO assessments (company_id, user_id) VALUES (?, ?)").run(company_id, user_id);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/assessments/:id", authenticateToken, (req, res) => {
    const assessment = db.prepare(`
      SELECT a.*, c.name as company_name 
      FROM assessments a 
      JOIN companies c ON a.company_id = c.id 
      WHERE a.id = ?
    `).get(req.params.id);
    const answers = db.prepare("SELECT * FROM answers WHERE assessment_id = ?").all(req.params.id);
      const a = assessment as any;
      res.json({ ...a, answers });
  });

  app.post("/api/assessments/:id/answers", authenticateToken, (req, res) => {
    const { answers } = req.body; // Array of { question_id, score, comments }
    const assessment_id = req.params.id;
    
    const deleteOld = db.prepare("DELETE FROM answers WHERE assessment_id = ?");
    const insertAnswer = db.prepare("INSERT INTO answers (assessment_id, question_id, score, comments) VALUES (?, ?, ?, ?)");
    
    const transaction = db.transaction((data) => {
      deleteOld.run(assessment_id);
      for (const ans of data) {
        insertAnswer.run(assessment_id, ans.question_id, ans.score, ans.comments);
      }
      db.prepare("UPDATE assessments SET status = 'completed' WHERE id = ?").run(assessment_id);
    });

    transaction(answers);
    res.json({ success: true });
  });

  app.get("/api/user/assessments", authenticateToken, (req: any, res) => {
    const assessments = db.prepare(`
      SELECT a.*, c.name as company_name 
      FROM assessments a 
      JOIN companies c ON a.company_id = c.id 
      WHERE a.user_id = ?
      ORDER BY a.date DESC
    `).all(req.user.id);
    res.json(assessments);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
