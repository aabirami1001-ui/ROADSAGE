const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'roadsage.db'));
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'user',createdAt TEXT NOT NULL);CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY AUTOINCREMENT,userId INTEGER NOT NULL,damageType TEXT NOT NULL,street TEXT NOT NULL,description TEXT,coordinates TEXT,imagePath TEXT,severity TEXT NOT NULL DEFAULT 'Unassessed',status TEXT NOT NULL DEFAULT 'Reported',createdAt TEXT NOT NULL,FOREIGN KEY(userId) REFERENCES users(id));`);
// Safe additive migrations for existing RoadSage databases.
const columns = db.prepare('PRAGMA table_info(reports)').all().map(c => c.name);
for (const [name, type] of [['riskScore','INTEGER NOT NULL DEFAULT 0'],['priority',"TEXT NOT NULL DEFAULT 'Medium'"],['assignedTeam','TEXT'],['repairImagePath','TEXT'],['verified','INTEGER NOT NULL DEFAULT 0']]) {
  if (!columns.includes(name)) db.exec(`ALTER TABLE reports ADD COLUMN ${name} ${type}`);
}
module.exports = db;
