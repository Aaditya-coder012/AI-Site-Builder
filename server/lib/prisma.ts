import "dotenv/config";
import crypto from "crypto";
import mongoose from "mongoose";
import {
  UserModel,
  WebsiteProjectModel,
  ConversationModel,
  VersionModel,
} from "./mongodb.js";

// In-Memory Database Store for Ephemeral AI Studio Environment
const users = new Map<string, any>();
const sessions = new Map<string, any>();
const accounts = new Map<string, any>();
const verifications = new Map<string, any>();
const websiteProjects = new Map<string, any>();
const conversations = new Map<string, any>();
const versions = new Map<string, any>();
const transactions = new Map<string, any>();

// Seed Demo User and Sample Project so the app is instantly rich and usable
const demoUserId = "demo-user-1";
const demoUser = {
  id: demoUserId,
  email: "demo@aisitebuilder.com",
  name: "Demo Creator",
  totalCreation: 1,
  credits: 20,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
users.set(demoUserId, demoUser);

const demoProjectId = "demo-portfolio";
const demoProject = {
  id: demoProjectId,
  name: "Modern Portfolio",
  initial_prompt:
    "Create a modern creative developer portfolio with dark theme, hero banner, interactive skills showcase, and contact form.",
  current_code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creative Developer Portfolio</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white">
  <nav class="fixed top-0 inset-x-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 z-50 px-6 py-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <a href="#" class="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Alex.dev</a>
      <div class="space-x-6 text-sm text-slate-300 font-medium hidden md:flex">
        <a href="#about" class="hover:text-indigo-400 transition-colors">About</a>
        <a href="#projects" class="hover:text-indigo-400 transition-colors">Projects</a>
        <a href="#skills" class="hover:text-indigo-400 transition-colors">Skills</a>
        <a href="#contact" class="hover:text-indigo-400 transition-colors">Contact</a>
      </div>
      <a href="#contact" class="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30">Get in touch</a>
    </div>
  </nav>

  <section class="pt-36 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium mb-8">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Available for new projects
    </div>
    <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight mb-6">
      Building modern digital experiences with <span class="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">clean code</span> and precision.
    </h1>
    <p class="text-slate-400 text-lg max-w-2xl mb-10 leading-relaxed">
      Full-stack engineer specializing in responsive web applications, delightful user experiences, and scalable cloud architectures.
    </p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <a href="#projects" class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-xl shadow-indigo-600/25">View Projects</a>
      <a href="#contact" class="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium transition-all">Contact Me</a>
    </div>
  </section>

  <section id="projects" class="py-20 px-6 max-w-6xl mx-auto border-t border-slate-900">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold tracking-tight mb-4">Featured Work</h2>
      <p class="text-slate-400">Curated collection of recent projects and applications.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
        <div class="h-44 rounded-xl bg-gradient-to-br from-indigo-900/40 to-slate-800 flex items-center justify-center text-indigo-400 mb-6 text-4xl group-hover:scale-[1.02] transition-transform">
          <i class="fa-solid fa-cloud-bolt"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors">CloudSync Platform</h3>
        <p class="text-slate-400 text-sm mb-4">Real-time collaborative workspace with automated cloud synchronization.</p>
        <div class="flex gap-2">
          <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">Next.js</span>
          <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">Tailwind</span>
          <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">PostgreSQL</span>
        </div>
      </div>
      <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
        <div class="h-44 rounded-xl bg-gradient-to-br from-sky-900/40 to-slate-800 flex items-center justify-center text-sky-400 mb-6 text-4xl group-hover:scale-[1.02] transition-transform">
          <i class="fa-solid fa-brain"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2 group-hover:text-sky-400 transition-colors">AI Studio Copilot</h3>
        <p class="text-slate-400 text-sm mb-4">Intelligent developer tool for auto-generating accessible UI components.</p>
        <div class="flex gap-2">
          <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">React</span>
          <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">Gemini API</span>
          <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">TypeScript</span>
        </div>
      </div>
      <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
        <div class="h-44 rounded-xl bg-gradient-to-br from-emerald-900/40 to-slate-800 flex items-center justify-center text-emerald-400 mb-6 text-4xl group-hover:scale-[1.02] transition-transform">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2 group-hover:text-emerald-400 transition-colors">Metrics Dash</h3>
        <p class="text-slate-400 text-sm mb-4">High-throughput analytics dashboard with customizable visualization widgets.</p>
        <div class="flex gap-2">
          <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">Vite</span>
          <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">D3.js</span>
          <span class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">Node</span>
        </div>
      </div>
    </div>
  </section>

  <footer class="py-10 border-t border-slate-900 text-center text-sm text-slate-500">
    <p>© 2026 Alex.dev — Crafted with AI Site Builder.</p>
  </footer>
</body>
</html>`,
  current_version_index: "v1-demo",
  userId: demoUserId,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
websiteProjects.set(demoProjectId, demoProject);

const demoVersion = {
  id: "v1-demo",
  code: demoProject.current_code,
  description: "Initial modern portfolio template",
  timestamp: new Date(),
  projectId: demoProjectId,
};
versions.set("v1-demo", demoVersion);

const demoConv1 = {
  id: "conv-1",
  role: "user",
  content: demoProject.initial_prompt,
  timestamp: new Date(Date.now() - 60000),
  projectId: demoProjectId,
};
const demoConv2 = {
  id: "conv-2",
  role: "assistant",
  content: "I've created your website! You can now preview it and request any changes.",
  timestamp: new Date(),
  projectId: demoProjectId,
};
conversations.set("conv-1", demoConv1);
conversations.set("conv-2", demoConv2);

function matchesWhere(item: any, where: any): boolean {
  if (!where || typeof where !== "object") return true;
  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;
    if (val !== null && typeof val === "object") {
      if ("in" in (val as any)) {
        if (!((val as any).in as any[]).includes(item[key])) return false;
      } else if ("equals" in (val as any)) {
        if (item[key] !== (val as any).equals) return false;
      } else if ("not" in (val as any)) {
        if (item[key] === (val as any).not) return false;
      } else if ("gt" in (val as any)) {
        if (item[key] <= (val as any).gt) return false;
      } else if ("lt" in (val as any)) {
        if (item[key] >= (val as any).lt) return false;
      } else if ("lte" in (val as any)) {
        if (item[key] > (val as any).lte) return false;
      } else if ("gte" in (val as any)) {
        if (item[key] < (val as any).gte) return false;
      }
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
}

function hydrateWebsiteProject(project: any, include: any) {
  if (!project) return null;
  const clone = { ...project };
  if (include?.versions) {
    clone.versions = Array.from(versions.values())
      .filter((v) => v.projectId === project.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  if (include?.conversation) {
    clone.conversation = Array.from(conversations.values())
      .filter((c) => c.projectId === project.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  if (include?.user) {
    clone.user = users.get(project.userId) || null;
  }
  return clone;
}

function hydrateSession(session: any, include: any) {
  if (!session) return null;
  const clone = { ...session };
  if (include?.user) {
    clone.user = users.get(session.userId) || null;
  }
  return clone;
}

const mongoModelMap: Record<string, any> = {
  User: UserModel,
  WebsiteProject: WebsiteProjectModel,
  Conversation: ConversationModel,
  Version: VersionModel,
};

function createCollection(
  store: Map<string, any>,
  modelName: string,
  hydrator?: (item: any, include: any) => any,
) {
  return {
    async findUnique(args: any = {}) {
      const { where, include } = args;
      for (const item of store.values()) {
        if (matchesWhere(item, where)) {
          return hydrator ? hydrator(item, include) : { ...item };
        }
      }
      return null;
    },
    async findFirst(args: any = {}) {
      const { where, include } = args;
      for (const item of store.values()) {
        if (matchesWhere(item, where)) {
          return hydrator ? hydrator(item, include) : { ...item };
        }
      }
      return null;
    },
    async findMany(args: any = {}) {
      const { where, include, orderBy } = args;
      let results: any[] = [];
      for (const item of store.values()) {
        if (matchesWhere(item, where)) {
          results.push(hydrator ? hydrator(item, include) : { ...item });
        }
      }
      if (orderBy && typeof orderBy === "object") {
        const [field, direction] = Object.entries(orderBy)[0] as [string, string];
        results.sort((a, b) => {
          const valA = a[field] instanceof Date ? a[field].getTime() : a[field];
          const valB = b[field] instanceof Date ? b[field].getTime() : b[field];
          if (direction === "desc") return valB > valA ? 1 : valB < valA ? -1 : 0;
          return valA > valB ? 1 : valA < valB ? -1 : 0;
        });
      }
      return results;
    },
    async create(args: any = {}) {
      const data = { ...args.data };
      if (!data.id) {
        data.id = crypto.randomUUID();
      }
      const now = new Date();
      if (!data.createdAt) data.createdAt = now;
      if (!data.updatedAt) data.updatedAt = now;
      if (!data.timestamp && (modelName === "Conversation" || modelName === "Version")) {
        data.timestamp = now;
      }
      store.set(data.id, data);
      const MongoModel = mongoModelMap[modelName];
      if (MongoModel && mongoose.connection.readyState === 1) {
        MongoModel.findOneAndUpdate({ id: data.id }, data, { upsert: true }).catch(() => {});
      }
      return hydrator ? hydrator(data, args.include) : { ...data };
    },
    async update(args: any = {}) {
      const { where, data, include } = args;
      let existing: any = null;
      for (const item of store.values()) {
        if (matchesWhere(item, where)) {
          existing = item;
          break;
        }
      }
      if (!existing) {
        const id = where?.id || crypto.randomUUID();
        const created = { id, ...data, updatedAt: new Date() };
        store.set(id, created);
        return hydrator ? hydrator(created, include) : { ...created };
      }
      const updated = { ...existing };
      for (const [k, v] of Object.entries(data)) {
        if (v !== null && typeof v === "object" && "increment" in (v as any)) {
          updated[k] = (Number(updated[k]) || 0) + Number((v as any).increment);
        } else if (v !== null && typeof v === "object" && "decrement" in (v as any)) {
          updated[k] = (Number(updated[k]) || 0) - Number((v as any).decrement);
        } else {
          updated[k] = v;
        }
      }
      updated.updatedAt = new Date();
      store.set(existing.id, updated);
      const MongoModel = mongoModelMap[modelName];
      if (MongoModel && mongoose.connection.readyState === 1) {
        MongoModel.findOneAndUpdate({ id: updated.id }, updated, { upsert: true }).catch(() => {});
      }
      return hydrator ? hydrator(updated, include) : { ...updated };
    },
    async upsert(args: any = {}) {
      const { where, update, create, include } = args;
      let existing: any = null;
      for (const item of store.values()) {
        if (matchesWhere(item, where)) {
          existing = item;
          break;
        }
      }
      if (existing) {
        return this.update({ where, data: update, include });
      }
      return this.create({ data: create, include });
    },
    async delete(args: any = {}) {
      const { where } = args;
      for (const [id, item] of store.entries()) {
        if (matchesWhere(item, where)) {
          store.delete(id);
          const MongoModel = mongoModelMap[modelName];
          if (MongoModel && mongoose.connection.readyState === 1 && item?.id) {
            MongoModel.deleteOne({ id: item.id }).catch(() => {});
          }
          return { ...item };
        }
      }
      return {};
    },
    async deleteMany(args: any = {}) {
      const { where } = args;
      let count = 0;
      for (const [id, item] of store.entries()) {
        if (matchesWhere(item, where)) {
          store.delete(id);
          count++;
        }
      }
      return { count };
    },
    async count(args: any = {}) {
      const { where } = args;
      let count = 0;
      for (const item of store.values()) {
        if (matchesWhere(item, where)) count++;
      }
      return count;
    },
  };
}

const mockPrisma: any = {
  user: createCollection(users, "User"),
  session: createCollection(sessions, "Session", hydrateSession),
  account: createCollection(accounts, "Account"),
  verification: createCollection(verifications, "Verification"),
  websiteProject: createCollection(websiteProjects, "WebsiteProject", hydrateWebsiteProject),
  conversation: createCollection(conversations, "Conversation"),
  version: createCollection(versions, "Version"),
  transaction: createCollection(transactions, "Transaction"),
  $connect: async () => {},
  $disconnect: async () => {},
  $transaction: async (input: any) => {
    if (typeof input === "function") {
      return input(mockPrisma);
    }
    if (Array.isArray(input)) {
      return Promise.all(input);
    }
    return input;
  },
  $extends: () => mockPrisma,
};

export default mockPrisma;
