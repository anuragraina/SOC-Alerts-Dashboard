import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { Severity, Status, Category } from '../types';

const DB_PATH = path.join(__dirname, '..', '..', 'alerts.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`DROP TABLE IF EXISTS alerts;`);
db.exec(`DROP TABLE IF EXISTS users;`);
db.exec(fs.readFileSync(SCHEMA_PATH, 'utf-8'));

const ANALYST_EMAIL = 'analyst@soc.local';

const userId = randomUUID();
const passwordHash = bcrypt.hashSync('analyst123', 10);
const now = new Date().toISOString();

db.prepare(
  `INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)`
).run(userId, ANALYST_EMAIL, passwordHash, 'Anurag Raina', now);

type Weighted<T extends string> = { value: T; weight: number };

function weightedPick<T extends string>(items: Weighted<T>[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

const SEVERITIES: Weighted<Severity>[] = [
  { value: 'critical', weight: 5 },
  { value: 'high', weight: 10 },
  { value: 'medium', weight: 25 },
  { value: 'low', weight: 35 },
  { value: 'info', weight: 25 },
];

const STATUSES: Weighted<Status>[] = [
  { value: 'new', weight: 60 },
  { value: 'investigating', weight: 20 },
  { value: 'resolved', weight: 15 },
  { value: 'false_positive', weight: 5 },
];

const CATEGORIES: Category[] = [
  'malware',
  'phishing',
  'unauthorized_access',
  'data_exfiltration',
  'policy_violation',
  'suspicious_login',
];

const SOURCES = ['endpoint-agent', 'email-gateway', 'firewall', 'cloud-audit'];

const TITLES: Record<Category, string[]> = {
  malware: [
    'Suspicious binary execution detected.',
    'Malware signature match on endpoint.',
    'Trojan dropper observed.',
    'Ransomware behavior detected on host.',
  ],
  phishing: [
    'Phishing email reported by user.',
    'Suspicious link clicked from inbox.',
    'Credential harvest attempt detected.',
    'Malicious attachment delivered to mailbox.',
  ],
  unauthorized_access: [
    'Unauthorized access attempt detected.',
    'Brute force login detected against account.',
    'Privilege escalation attempt observed.',
    'Admin access from unrecognized host.',
  ],
  data_exfiltration: [
    'Large outbound data transfer flagged.',
    'Sensitive file uploaded to external cloud.',
    'DLP rule triggered on outbound traffic.',
    'Unusual egress volume to external IP.',
  ],
  policy_violation: [
    'Acceptable use policy violation detected.',
    'Unapproved software installed on host.',
    'Encryption policy breach detected.',
    'Data classification policy violation.',
  ],
  suspicious_login: [
    'Login from unusual geographic location.',
    'Impossible travel detected for user.',
    'Login attempt outside business hours.',
    'Concurrent sessions from different countries.',
  ],
};

const DESCRIPTIONS: Record<Category, string[]> = {
  malware: [
    'Endpoint flagged a suspicious binary executing under an unusual parent process.',
    'Hash matched a known malware signature pulled from threat intel feed.',
    'Process exhibited file-encryption behavior consistent with ransomware tooling.',
  ],
  phishing: [
    'Email gateway classifier scored an inbound message as a phishing attempt.',
    'User reported a suspicious email; embedded link resolved to a credential harvest page.',
    'Attachment sandbox detonation revealed a malicious macro payload.',
  ],
  unauthorized_access: [
    'Multiple failed authentication attempts were followed by a successful login from a new device.',
    'Account elevated to administrator role outside of the standard approval workflow.',
    'Privileged action originated from a host with no prior admin activity.',
  ],
  data_exfiltration: [
    'Outbound transfer to an external destination exceeded baseline volume by several orders of magnitude.',
    'DLP rule fired on a file containing classified content leaving the corporate network.',
    'Large egress flow observed to a destination country flagged in policy.',
  ],
  policy_violation: [
    'User performed an action that breaches the organization\'s acceptable use policy.',
    'Endpoint installed software not listed on the approved application catalog.',
    'Unencrypted data was transmitted in violation of the data protection policy.',
  ],
  suspicious_login: [
    'Login event flagged due to anomalous geo-location and device fingerprint.',
    'Successive logins from geographically incompatible locations within a short window.',
    'Authentication occurred from an IP address with poor reputation.',
  ],
};

function pickAsset(): string {
  const r = Math.random();
  if (r < 0.4) return faker.internet.ipv4();
  if (r < 0.75) return `HOST-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`;
  return `${faker.internet.username()}@soc.local`;
}

function pickCreatedAt(): Date {
  if (Math.random() < 0.5) return faker.date.recent({ days: 7 });
  return faker.date.between({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });
}

function buildRawEvent(category: Category, source: string, asset: string): Record<string, unknown> {
  switch (category) {
    case 'malware':
      return {
        process_name: faker.helpers.arrayElement(['powershell.exe', 'cmd.exe', 'rundll32.exe', 'svchost.exe', 'wscript.exe']),
        parent_process: faker.helpers.arrayElement(['explorer.exe', 'outlook.exe', 'winword.exe', 'chrome.exe']),
        file_path: `C:\\Users\\${faker.internet.username()}\\AppData\\Local\\Temp\\${faker.system.fileName()}`,
        file_hash: faker.string.hexadecimal({ length: 64, prefix: '' }).toLowerCase(),
        command_line: `${faker.system.fileName()} -e ${faker.string.alphanumeric(20)}`,
        signature: faker.helpers.arrayElement(['Emotet', 'Cobalt Strike', 'AsyncRAT', 'Qakbot', 'unknown']),
        source,
      };
    case 'phishing':
      return {
        sender: faker.internet.email(),
        recipient: `${faker.internet.username()}@soc.local`,
        subject: faker.helpers.arrayElement([
          'Urgent: Verify your account',
          'Invoice attached - action required',
          'Mailbox quota exceeded',
          'Shared document waiting for review',
        ]),
        message_id: `<${faker.string.uuid()}@${faker.internet.domainName()}>`,
        classifier_score: faker.number.float({ min: 0.6, max: 0.99, fractionDigits: 2 }),
        link_count: faker.number.int({ min: 1, max: 5 }),
        attachment_name: faker.helpers.maybe(() => faker.system.fileName(), { probability: 0.6 }) ?? null,
      };
    case 'unauthorized_access':
      return {
        source_ip: faker.internet.ipv4(),
        dest_ip: faker.internet.ipv4(),
        username: faker.internet.username(),
        attempts: faker.number.int({ min: 3, max: 200 }),
        success: faker.datatype.boolean(),
        protocol: faker.helpers.arrayElement(['SSH', 'RDP', 'SMB', 'HTTPS']),
        port: faker.helpers.arrayElement([22, 3389, 445, 443]),
      };
    case 'data_exfiltration':
      return {
        src_ip: faker.internet.ipv4(),
        dest_ip: faker.internet.ipv4(),
        bytes_transferred: faker.number.int({ min: 50_000_000, max: 5_000_000_000 }),
        protocol: faker.helpers.arrayElement(['HTTPS', 'FTP', 'SFTP', 'SMB']),
        destination_country: faker.location.countryCode(),
        duration_seconds: faker.number.int({ min: 30, max: 3600 }),
        dlp_rule: faker.helpers.arrayElement(['PII', 'PCI', 'Source Code', 'Confidential']),
      };
    case 'policy_violation':
      return {
        user: `${faker.internet.username()}@soc.local`,
        policy_id: `POL-${faker.string.numeric(4)}`,
        policy_name: faker.helpers.arrayElement([
          'Acceptable Use',
          'Software Whitelist',
          'Data Classification',
          'Encryption at Rest',
        ]),
        resource: asset,
        action: faker.helpers.arrayElement(['install', 'upload', 'share', 'execute']),
        risk_score: faker.number.int({ min: 30, max: 90 }),
      };
    case 'suspicious_login':
      return {
        user: `${faker.internet.username()}@soc.local`,
        source_ip: faker.internet.ipv4(),
        country: faker.location.countryCode(),
        user_agent: faker.internet.userAgent(),
        mfa_used: faker.datatype.boolean(),
        session_id: faker.string.uuid(),
        login_type: faker.helpers.arrayElement(['interactive', 'remote', 'service', 'api']),
      };
  }
}

const insertAlert = db.prepare(
  `INSERT INTO alerts (
    id, title, severity, status, category, source, affected_asset, assignee,
    description, raw_event, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const insertMany = db.transaction(() => {
  for (let i = 0; i < 1000; i++) {
    const severity = weightedPick(SEVERITIES);
    const status = weightedPick(STATUSES);
    const category = faker.helpers.arrayElement(CATEGORIES);
    const source = faker.helpers.arrayElement(SOURCES);
    const asset = pickAsset();
    const assignee = Math.random() < 0.7 ? null : ANALYST_EMAIL;

    const createdAt = pickCreatedAt();
    const updatedAt = status === 'new'
      ? null
      : new Date(
          createdAt.getTime() + faker.number.int({ min: 0, max: 2 * 24 * 60 * 60 * 1000 })
        );

    const title = faker.helpers.arrayElement(TITLES[category]);
    const description = faker.helpers.arrayElement(DESCRIPTIONS[category]);
    const rawEvent = JSON.stringify(buildRawEvent(category, source, asset));

    insertAlert.run(
      randomUUID(),
      title,
      severity,
      status,
      category,
      source,
      asset,
      assignee,
      description,
      rawEvent,
      createdAt.toISOString(),
      updatedAt?.toISOString() ?? null
    );
  }
});

insertMany();

console.log('Seeded 1000 alerts and 1 user');
