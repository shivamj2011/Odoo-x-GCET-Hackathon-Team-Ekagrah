const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { db, init } = require('./db');

init();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// Helper to parse JSON columns
function parseJSONOrNull(val) {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

// Sync endpoints
app.get('/api/sync/pull', (req, res) => {
  const employees = db.prepare('SELECT * FROM employees').all().map((r) => ({
    ...r,
    skills: parseJSONOrNull(r.skills) || [],
    certifications: parseJSONOrNull(r.certifications) || [],
    salary: parseJSONOrNull(r.salary) || null,
  }));
  const leaves = db.prepare('SELECT * FROM leaves').all();
  const attendance = db.prepare('SELECT * FROM attendance').all();
  res.json({ employees, leaves, attendance });
});

app.post('/api/sync/push', (req, res) => {
  const { employees = [], leaves = [], attendance = [] } = req.body || {};

  const insertEmployee = db.prepare(
    `INSERT OR REPLACE INTO employees (id, loginId, password, name, email, role, department, position, avatar, joinDate, phone, address, photo, resume, skills, certifications, salary, privateInfo)
     VALUES (@id,@loginId,@password,@name,@email,@role,@department,@position,@avatar,@joinDate,@phone,@address,@photo,@resume,@skills,@certifications,@salary,@privateInfo)`
  );

  const insertLeave = db.prepare(
    `INSERT OR REPLACE INTO leaves (id,userId,userName,type,startDate,endDate,reason,status,appliedOn) VALUES (@id,@userId,@userName,@type,@startDate,@endDate,@reason,@status,@appliedOn)`
  );

  const insertAttendance = db.prepare(
    `INSERT OR REPLACE INTO attendance (id,userId,date,checkIn,checkOut,hoursWorked,status) VALUES (@id,@userId,@date,@checkIn,@checkOut,@hoursWorked,@status)`
  );

  const empTx = db.transaction((emps) => {
    for (const e of emps) {
      insertEmployee.run({
        id: e.id || `emp-${Date.now()}-${Math.floor(Math.random()*10000)}`,
        loginId: e.loginId,
        password: e.password,
        name: e.name,
        email: e.email,
        role: e.role,
        department: e.department,
        position: e.position,
        avatar: e.avatar,
        joinDate: e.joinDate,
        phone: e.phone,
        address: e.address,
        photo: e.photo,
        resume: e.resume,
        skills: JSON.stringify(e.skills || []),
        certifications: JSON.stringify(e.certifications || []),
        salary: JSON.stringify(e.salary || null),
        privateInfo: e.privateInfo || null,
      });
    }
  });

  const leaveTx = db.transaction((ls) => {
    for (const l of ls) {
      insertLeave.run(l);
    }
  });

  const attTx = db.transaction((ats) => {
    for (const a of ats) {
      insertAttendance.run(a);
    }
  });

  empTx(employees);
  leaveTx(leaves);
  attTx(attendance);

  res.json({ ok: true });
});

// Convenience endpoints for sync testing
app.get('/api/employees', (req, res) => {
  const rows = db.prepare('SELECT * FROM employees').all().map((r) => ({
    ...r,
    skills: parseJSONOrNull(r.skills) || [],
    certifications: parseJSONOrNull(r.certifications) || [],
    salary: parseJSONOrNull(r.salary) || null,
  }));
  res.json(rows);
});

app.post('/api/employees', (req, res) => {
  const data = req.body;
  const id = data.id || `emp-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  db.prepare(`INSERT OR REPLACE INTO employees (id, loginId, password, name, email, role, department, position, avatar, joinDate, phone, address, photo, resume, skills, certifications, salary, privateInfo) VALUES (@id,@loginId,@password,@name,@email,@role,@department,@position,@avatar,@joinDate,@phone,@address,@photo,@resume,@skills,@certifications,@salary,@privateInfo)`).run({
    id,
    loginId: data.loginId,
    password: data.password,
    name: data.name,
    email: data.email,
    role: data.role,
    department: data.department,
    position: data.position,
    avatar: data.avatar,
    joinDate: data.joinDate,
    phone: data.phone,
    address: data.address,
    photo: data.photo,
    resume: data.resume,
    skills: JSON.stringify(data.skills || []),
    certifications: JSON.stringify(data.certifications || []),
    salary: JSON.stringify(data.salary || null),
    privateInfo: data.privateInfo || null,
  });
  res.json({ id });
});

app.put('/api/employees/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  db.prepare(`UPDATE employees SET name=@name,email=@email,department=@department,position=@position,avatar=@avatar,phone=@phone,address=@address,photo=@photo,resume=@resume,skills=@skills,certifications=@certifications,salary=@salary,privateInfo=@privateInfo WHERE id=@id`).run({
    id,
    name: data.name,
    email: data.email,
    department: data.department,
    position: data.position,
    avatar: data.avatar,
    phone: data.phone,
    address: data.address,
    photo: data.photo,
    resume: data.resume,
    skills: JSON.stringify(data.skills || []),
    certifications: JSON.stringify(data.certifications || []),
    salary: JSON.stringify(data.salary || null),
    privateInfo: data.privateInfo || null,
  });
  res.json({ ok: true });
});

app.delete('/api/employees/:id', (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM employees WHERE id = ?').run(id);
  res.json({ ok: true });
});

// Leaves endpoints
app.get('/api/leaves', (req, res) => {
  res.json(db.prepare('SELECT * FROM leaves').all());
});

app.post('/api/leaves', (req, res) => {
  const l = req.body;
  const id = l.id || `leave-${Date.now()}`;
  db.prepare('INSERT OR REPLACE INTO leaves (id,userId,userName,type,startDate,endDate,reason,status,appliedOn) VALUES (@id,@userId,@userName,@type,@startDate,@endDate,@reason,@status,@appliedOn)').run({
    id,
    userId: l.userId,
    userName: l.userName,
    type: l.type,
    startDate: l.startDate,
    endDate: l.endDate,
    reason: l.reason,
    status: l.status,
    appliedOn: l.appliedOn,
  });
  res.json({ id });
});

app.put('/api/leaves/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  db.prepare('UPDATE leaves SET status = ? WHERE id = ?').run(status, id);
  res.json({ ok: true });
});

// Attendance endpoints
app.get('/api/attendance/:userId', (req, res) => {
  const userId = req.params.userId;
  const rows = db.prepare('SELECT * FROM attendance WHERE userId = ? ORDER BY date DESC').all(userId);
  res.json(rows);
});

app.post('/api/attendance', (req, res) => {
  const a = req.body;
  const id = a.id || `att-${Date.now()}`;
  db.prepare('INSERT OR REPLACE INTO attendance (id,userId,date,checkIn,checkOut,hoursWorked,status) VALUES (@id,@userId,@date,@checkIn,@checkOut,@hoursWorked,@status)').run({
    id,
    userId: a.userId,
    date: a.date,
    checkIn: a.checkIn,
    checkOut: a.checkOut,
    hoursWorked: a.hoursWorked || 0,
    status: a.status,
  });
  res.json({ id });
});

// Simple auth: validate loginId + password
app.post('/api/auth/login', (req, res) => {
  const { loginId, password } = req.body;
  const row = db.prepare('SELECT * FROM employees WHERE LOWER(loginId) = LOWER(?)').get(loginId);
  if (!row) return res.json({ success: false, error: 'Invalid Login ID' });
  if (row.password !== password) return res.json({ success: false, error: 'Incorrect password' });
  // return user without password
  const { password: _, skills, certifications, salary, ...user } = row;
  res.json({ success: true, user: { ...user, skills: parseJSONOrNull(skills) || [], certifications: parseJSONOrNull(certifications) || [], salary: parseJSONOrNull(salary) || null } });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`DayFlow server listening on http://localhost:${PORT}`);
});
