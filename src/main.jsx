import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, UserRound, BrainCircuit, Target, Route, Settings,
  Search, Bell, ArrowUpRight, Sparkles, CheckCircle2, Clock3,
  BriefcaseBusiness, Zap, Menu, X, LockKeyhole, GitCompareArrows
} from 'lucide-react';
import './styles.css';
import { analyzeCareer } from './aiClient';
import AIChatWidget from './AIChatWidget';

const careers = {
  'Cloud Engineer': {
    skills: [['Linux', 90, 'Strong', '🐧'], ['Networking', 84, 'Strong', '🌐'], ['AWS', 54, 'Developing', '☁️'], ['Docker', 0, 'Missing', '🐳'], ['Kubernetes', 0, 'Missing', '⎈'], ['Terraform', 0, 'Missing', '🔧']],
    roadmap: [['Master Docker', 'Learn images, containers, volumes and networking.'], ['Build a containerized app', 'Use Docker Compose.'], ['Explore cloud and Kubernetes', 'Deploy and practise orchestration.'], ['Automate infrastructure', 'Use Terraform and document deployment.']]
  },
  'Java Developer': {
    skills: [['Core Java', 88, 'Strong', '☕'], ['OOP & Design Patterns', 82, 'Strong', '🧩'], ['Spring Boot', 58, 'Developing', '🍃'], ['SQL & JPA', 52, 'Developing', '🗄️'], ['Testing (JUnit)', 0, 'Missing', '🧪'], ['CI/CD', 0, 'Missing', '🚀']],
    roadmap: [['Strengthen Java and OOP', 'Practise collections, exceptions, streams and patterns.'], ['Build REST APIs', 'Use Spring Boot controller, service and repository layers.'], ['Add SQL and testing', 'Use JPA and write JUnit tests.'], ['Deploy your project', 'Configure CI/CD and document your API.']]
  },
  'Full Stack Developer': {
    skills: [['HTML / CSS', 90, 'Strong', '🎨'], ['JavaScript', 82, 'Strong', '⚡'], ['React', 56, 'Developing', '⚛️'], ['REST APIs', 55, 'Developing', '🔌'], ['Testing', 0, 'Missing', '🧪'], ['Deployment', 0, 'Missing', '🚀']],
    roadmap: [['Strengthen JavaScript and React', 'Practise components, hooks and state.'], ['Connect React to APIs', 'Handle loading and errors.'], ['Add testing', 'Test API and user flows.'], ['Deploy the application', 'Document the architecture.']]
  },
  'Data Analyst': {
    skills: [['SQL', 88, 'Strong', '🗄️'], ['Excel', 84, 'Strong', '📊'], ['Python', 58, 'Developing', '🐍'], ['Power BI', 50, 'Developing', '📈'], ['Statistics', 0, 'Missing', '📐'], ['Data Storytelling', 0, 'Missing', '💡']],
    roadmap: [['Practise SQL', 'Use joins and aggregations.'], ['Analyse data with Python', 'Clean data with pandas.'], ['Create a Power BI dashboard', 'Build visuals and KPIs.'], ['Present insights', 'Document findings and recommendations.']]
  },
  'Frontend Developer': {
    skills: [['HTML & CSS', 88, 'Strong', '🎨'], ['JavaScript', 60, 'Developing', '⚡'], ['React', 55, 'Developing', '⚛️'], ['Responsive Design', 50, 'Developing', '📱'], ['Frontend Testing', 0, 'Missing', '🧪'], ['Deployment', 0, 'Missing', '🚀']],
    roadmap: [['Master HTML and CSS', 'Build responsive layouts.'], ['Build a React application', 'Practise hooks and forms.'], ['Add API integration', 'Handle errors and loading states.'], ['Deploy your portfolio', 'Publish and document your work.']]
  },
  'Python Developer': {
    skills: [['Core Python', 85, 'Strong', '🐍'], ['OOP', 60, 'Developing', '🧩'], ['REST APIs', 52, 'Developing', '🔌'], ['SQL', 50, 'Developing', '🗄️'], ['Automated Testing', 0, 'Missing', '🧪'], ['Deployment', 0, 'Missing', '🚀']],
    roadmap: [['Strengthen Python', 'Practise collections, functions and OOP.'], ['Build a REST API', 'Add validation and error handling.'], ['Connect SQL and tests', 'Persist data and test endpoints.'], ['Deploy your application', 'Document dependencies.']]
  },
  'DevOps Engineer': {
    skills: [['Linux', 85, 'Strong', '🐧'], ['Git', 80, 'Strong', '🔀'], ['Docker', 55, 'Developing', '🐳'], ['CI/CD', 50, 'Developing', '⚙️'], ['Kubernetes', 0, 'Missing', '⎈'], ['Terraform', 0, 'Missing', '🔧']],
    roadmap: [['Practise Linux and Git', 'Automate common tasks.'], ['Containerize an app', 'Use Docker Compose.'], ['Create a CI/CD pipeline', 'Automate builds and tests.'], ['Deploy and monitor', 'Practise cloud deployment.']]
  },
  'Machine Learning Engineer': {
    skills: [['Python', 85, 'Strong', '🐍'], ['Statistics', 60, 'Developing', '📊'], ['Machine Learning', 55, 'Developing', '🤖'], ['Data Processing', 50, 'Developing', '🧹'], ['Model Deployment', 0, 'Missing', '🚀'], ['MLOps', 0, 'Missing', '⚙️']],
    roadmap: [['Prepare a dataset', 'Clean and analyse data.'], ['Train an ML model', 'Evaluate model performance.'], ['Create an inference API', 'Serve predictions.'], ['Document the model', 'Record metrics and limitations.']]
  },
  'Cybersecurity Analyst': {
    skills: [['Networking', 82, 'Strong', '🌐'], ['Linux', 60, 'Developing', '🐧'], ['Security Fundamentals', 55, 'Developing', '🛡️'], ['Log Analysis', 50, 'Developing', '🔎'], ['Incident Response', 0, 'Missing', '🚨'], ['SIEM Tools', 0, 'Missing', '📡']],
    roadmap: [['Practise networking and Linux', 'Understand protocols and logs.'], ['Analyse security logs', 'Use safe sample data.'], ['Practise incident response', 'Document a simulated incident.'], ['Create a security case study', 'Present defensive recommendations.']]
  }
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const endpoint = mode === 'login'
        ? '/api/auth/login'
        : '/api/auth/register';

      const body = mode === 'login'
        ? { email, password }
        : { name: fullName, email, password };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Authentication failed.');
      }

      if (!data.token) {
        throw new Error('Backend did not return a token.');
      }

      const user = data.user || {
        name: fullName || email.split('@')[0],
        email
      };

      localStorage.setItem('skilltwin_token', data.token);
      localStorage.setItem('skilltwin_user', JSON.stringify(user));
      onAuthenticated(user);
    } catch (err) {
      setError(err.message || 'Could not connect to backend.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-brand">
        <div className="brand-mark"><BrainCircuit size={23} /></div>
        <div><b>SkillTwin</b><small>CAREER COPILOT</small></div>
      </div>

      <div className="auth-layout">
        <section className="auth-pitch">
          <div className="auth-eyebrow">
            <span className="live-dot" /> YOUR AI-POWERED CAREER COMPANION
          </div>
          <h1>Your skills.<br />Your future.<br /><span>Your next move.</span></h1>
          <p className="auth-description">
            Find your skill gaps, discover your strengths, and take the next step with confidence.
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <div className="auth-benefit-icon"><Target size={18} /></div>
              <div><b>Know your readiness</b><small>Understand strengths and gaps.</small></div>
            </div>
            <div className="auth-benefit">
              <div className="auth-benefit-icon"><BrainCircuit size={18} /></div>
              <div><b>Build the right skills</b><small>Focus on what your role needs.</small></div>
            </div>
            <div className="auth-benefit">
              <div className="auth-benefit-icon"><Route size={18} /></div>
              <div><b>Follow your roadmap</b><small>Turn career goals into actions.</small></div>
            </div>
          </div>

          <blockquote className="auth-quote">
            “Your next opportunity starts with knowing what to learn next.”
          </blockquote>
        </section>

        <section className="auth-card">
          <div className="auth-card-top">
            <span className="auth-card-icon"><Sparkles size={19} /></span>
            <span className="auth-card-note">YOUR NEXT CHAPTER STARTS HERE</span>
          </div>

          <div className="auth-tabs">
            <button type="button" className={mode === 'login' ? 'selected' : ''}
              onClick={() => { setMode('login'); setError(''); }}>Log in</button>
            <button type="button" className={mode === 'register' ? 'selected' : ''}
              onClick={() => { setMode('register'); setError(''); }}>Create account</button>
          </div>

          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}<span>.</span></h2>
          <p className="auth-card-description">
            {mode === 'login'
              ? 'Pick up where your career journey left off.'
              : 'Create an account and start your career roadmap.'}
          </p>

          <form onSubmit={submit}>
            {mode === 'register' && (
              <label>Full name
                <input required autoComplete="name" value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name" />
              </label>
            )}

            <label>Email address
              <input required type="email" autoComplete="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>

            <label>Password
              <input required type="password" minLength="8"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters" />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button className="primary-btn full-btn auth-submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in to SkillTwin' : 'Create my account'}
              <ArrowUpRight size={16} />
            </button>
          </form>

          <div className="auth-secure">
            <CheckCircle2 size={14} /> Your career journey, all in one place.
          </div>

          <div className="auth-switch">
            {mode === 'login' ? 'New to SkillTwin? ' : 'Already have an account? '}
            <button type="button" onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}>
              {mode === 'login' ? 'Create account' : 'Log in'}
            </button>
          </div>
        </section>
      </div>

      <footer className="auth-footer">
        <span>© 2026 SkillTwin · Team ZeroDay</span>
        <span>AXION Hackathon prototype</span>
      </footer>
    </div>
  );
}

function App() {
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('skilltwin_user') || 'null');
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => localStorage.getItem('skilltwin_role') || 'Cloud Engineer');
  const [compareRole, setCompareRole] = useState('Java Developer');
  const [page, setPage] = useState('Overview');

  const [name, setName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('skilltwin_user') || '{}').name || 'Student';
    } catch {
      return 'Student';
    }
  });

  const [savedProfile, setSavedProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('skilltwin_student_profile') || '{}');
    } catch {
      return {};
    }
  });

  const [skillsInput, setSkillsInput] = useState(() => savedProfile.skillsText || 'Linux, Networking, AWS');
  const [projects, setProjects] = useState(() => savedProfile.projectsCount || '2');
  const [githubUrl, setGithubUrl] = useState(() => savedProfile.githubUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(() => savedProfile.portfolioUrl || '');
  const [projectDetails, setProjectDetails] = useState(() => savedProfile.projectDetails || '');
  const [coursesText, setCoursesText] = useState(() => savedProfile.coursesText || '');
  const [certificationsText, setCertificationsText] = useState(() => savedProfile.certificationsText || '');
  const [internshipsText, setInternshipsText] = useState(() => savedProfile.internshipsText || '');
  const [resumeSummary, setResumeSummary] = useState(() => savedProfile.resumeSummary || '');
  const [educationText, setEducationText] = useState(() => savedProfile.educationText || '');
  const [experienceText, setExperienceText] = useState(() => savedProfile.experienceText || '');
  const [resumeFileName, setResumeFileName] = useState(() => savedProfile.resumeFileName || '');
  const [resumePreview, setResumePreview] = useState('');

  const [notice, setNotice] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');

  const [roadmapProgress, setRoadmapProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('skilltwin_roadmap_progress') || '{}');
    } catch {
      return {};
    }
  });

  const [weeklyReminders, setWeeklyReminders] = useState(
    () => localStorage.getItem('skilltwin_weekly_reminders') === 'true'
  );
  const [progressNotifications, setProgressNotifications] = useState(
    () => localStorage.getItem('skilltwin_progress_notifications') !== 'false'
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  const roadmapDurations = [4, 8, 12, 16, 24, 36, 52];
  const [roadmapWeeks, setRoadmapWeeks] = useState(() => {
    const saved = Number(localStorage.getItem('skilltwin_roadmap_weeks'));
    return roadmapDurations.includes(saved) ? saved : 12;
  });

  const career = careers[role] || careers['Cloud Engineer'];

  const aiProfile = {
    name: name || 'Student',
    targetCareer: role,
    skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),

    projects: projectDetails.trim()
      ? projectDetails.split('\n').filter(Boolean).map((line, i) => ({
          name: line.split('|')[0]?.trim() || `Project ${i + 1}`,
          description: line.split('|')[1]?.trim() || '',
          technologies: (line.split('|')[2] || '')
            .split(',').map(v => v.trim()).filter(Boolean)
        })).slice(0, 30)
      : Array.from({
          length: projects === '4+' ? 4 : Number(projects) || 0
        }, (_, i) => ({
          name: `Project ${i + 1} (details not provided)`,
          description: 'Project count provided; details not supplied.',
          technologies: []
        })),

    courses: coursesText.split('\n').map(s => s.trim()).filter(Boolean),
    certifications: certificationsText.split('\n').map(s => s.trim()).filter(Boolean),
    internships: internshipsText.split('\n').map(s => s.trim()).filter(Boolean),
    durationWeeks: roadmapWeeks
  };

  async function runAiAnalysis() {
    setAiBusy(true);
    setAiError('');
    setNotice('');

    try {
      const result = await analyzeCareer(aiProfile);
      if (!result) throw new Error('AI returned an empty response.');
      setAiAnalysis(result);
      setNotice('AI career analysis completed.');
    } catch (err) {
      setAiError(err.message || 'Could not connect to AI service.');
    } finally {
      setAiBusy(false);
    }
  }

  const skills = useMemo(() => {
    if (aiAnalysis?.skillGaps?.length) {
      return aiAnalysis.skillGaps.map((item, i) => ({
        name: typeof item === 'string'
          ? item
          : item.skill || item.name || `Skill ${i + 1}`,
        score: 0,
        level: 'Missing',
        icon: '🎯',
        evidence: 'AI identified as a skill gap'
      }));
    }

    return career.skills.map(([name, score, level, icon]) => ({
      name,
      score,
      level,
      icon,
      evidence: score === 0 ? 'No evidence found' : 'Sample profile evidence'
    }));
  }, [role, aiAnalysis]);

  const roadmap = useMemo(() => {
    const completedTasks = roadmapProgress[role] || {};
    const aiRoadmap = Array.isArray(aiAnalysis?.roadmap)
      ? aiAnalysis.roadmap
      : null;

    return Array.from({ length: roadmapWeeks }, (_, i) => {
      const item = aiRoadmap?.[i % (aiRoadmap.length || 1)];
      const base = career.roadmap[i % career.roadmap.length];

      return {
        title: item?.title || base[0],
        detail: item?.objective || item?.description || base[1],
        week: `WEEK ${String(i + 1).padStart(2, '0')}`,
        tag: item?.phase || ['Learn', 'Practise', 'Build', 'Validate'][i % 4],
        done: completedTasks[i] ?? false
      };
    });
  }, [role, roadmapProgress, roadmapWeeks, aiAnalysis]);

  const ready = aiAnalysis && Number.isFinite(Number(aiAnalysis.readinessScore))
    ? Math.max(0, Math.min(100, Math.round(Number(aiAnalysis.readinessScore))))
    : Math.round(
        career.skills.reduce((sum, s) => sum + s[1], 0) / career.skills.length
      );

  const missing = skills.filter(s => s.level === 'Missing');
  const completed = roadmap.filter(t => t.done).length;
  const compareCareer = careers[compareRole] || careers['Java Developer'];
  const compareReady = Math.round(
    compareCareer.skills.reduce((sum, s) => sum + s[1], 0) /
    compareCareer.skills.length
  );

  function changeRole(newRole) {
    if (!careers[newRole]) return;
    setRole(newRole);
    setAiAnalysis(null);
    localStorage.setItem('skilltwin_role', newRole);
  }

  function changeRoadmapDuration(value) {
    const weeks = Number(value);
    if (!roadmapDurations.includes(weeks)) return;

    setRoadmapWeeks(weeks);
    localStorage.setItem('skilltwin_roadmap_weeks', String(weeks));
    setNotice(`Roadmap updated to ${weeks} weeks.`);
  }

  function saveSettings() {
    const user = { ...(authUser || {}), name };
    localStorage.setItem('skilltwin_user', JSON.stringify(user));
    localStorage.setItem('skilltwin_role', role);
    localStorage.setItem('skilltwin_weekly_reminders', String(weeklyReminders));
    localStorage.setItem('skilltwin_progress_notifications', String(progressNotifications));

    const profileData = {
      skillsText: skillsInput,
      projectsCount: projects,
      githubUrl,
      portfolioUrl,
      projectDetails,
      coursesText,
      certificationsText,
      internshipsText,
      resumeSummary,
      educationText,
      experienceText,
      resumeFileName
    };

    localStorage.setItem('skilltwin_student_profile', JSON.stringify(profileData));
    setSavedProfile(profileData);
    setAuthUser(user);
    setNotice('Student profile saved in this browser.');
  }

  function handleResumeUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    setNotice(
      `Selected resume: ${file.name}. Fill in the builder fields below to create an editable resume.`
    );
  }

  function buildResume() {
    const user = authUser || {};
    const skillList = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

    const projectsList = projectDetails.trim()
      ? projectDetails.split('\n').filter(Boolean).map(line => {
          const parts = line.split('|').map(part => part.trim());
          return `- ${parts[0] || 'Project'}${parts[1] ? `: ${parts[1]}` : ''}${parts[2] ? `\n  Technologies: ${parts[2]}` : ''}`;
        }).join('\n')
      : `${projects} project(s) listed; add project details in Student Profile.`;

    const resume = [
      (name || user.name || 'Your Name').toUpperCase(),
      user.email || '',
      githubUrl ? `GitHub: ${githubUrl}` : '',
      portfolioUrl ? `Portfolio: ${portfolioUrl}` : '',
      '',
      'PROFESSIONAL SUMMARY',
      resumeSummary || 'Add a short professional summary in the Student Profile.',
      '',
      'SKILLS',
      skillList.join(', ') || 'Add your skills',
      '',
      'PROJECTS',
      projectsList,
      '',
      'INTERNSHIPS / EXPERIENCE',
      internshipsText || 'Add internships or experience',
      experienceText,
      '',
      'EDUCATION',
      educationText || 'Add your education',
      '',
      'CERTIFICATIONS',
      certificationsText || 'Add certifications',
      '',
      'COURSES',
      coursesText || 'Add courses'
    ].filter((line, index, arr) => !(line === '' && arr[index - 1] === '')).join('\n');

    setResumePreview(resume);
    setNotice('Resume preview generated. Review it below and download when ready.');
  }

  function downloadResume() {
    if (!resumePreview) {
      setNotice('Generate the resume preview first.');
      return;
    }

    const blob = new Blob([resumePreview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `${(name || 'SkillTwin').replace(/[^a-z0-9-_]/gi, '_')}_Resume.txt`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function toggleTask(index) {
    setRoadmapProgress(prev => {
      const updated = {
        ...prev,
        [role]: {
          ...(prev[role] || {}),
          [index]: !(prev[role]?.[index] ?? false)
        }
      };

      localStorage.setItem('skilltwin_roadmap_progress', JSON.stringify(updated));
      return updated;
    });

    if (progressNotifications) setNotice('Roadmap progress updated.');
  }

  function logout() {
    localStorage.removeItem('skilltwin_token');
    localStorage.removeItem('skilltwin_user');
    setAuthUser(null);
    setPage('Overview');
  }

  async function changePassword(e) {
    e.preventDefault();

    if (newPassword.length < 8) {
      return setNotice('Password must be at least 8 characters.');
    }

    if (newPassword !== confirmPassword) {
      return setNotice('Passwords do not match.');
    }

    setPasswordBusy(true);

    try {
      const token = localStorage.getItem('skilltwin_token');
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Password endpoint unavailable.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice('Password changed.');
    } catch (err) {
      setNotice(err.message);
    } finally {
      setPasswordBusy(false);
    }
  }

  if (!authUser) return <AuthScreen onAuthenticated={setAuthUser} />;

  const nav = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'My SkillTwin', icon: BrainCircuit },
    { name: 'Career Match', icon: Target },
    { name: 'Roadmap', icon: Route }
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><BrainCircuit size={23} /></div>
          <div><b>SkillTwin</b><small>CAREER COPILOT</small></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <div className="nav-list">
          {nav.map(item => (
            <button key={item.name}
              className={`nav-item ${page === item.name ? 'active' : ''}`}
              onClick={() => { setPage(item.name); setMobileOpen(false); }}>
              <item.icon size={18} /><span>{item.name}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><Sparkles size={17} /></div>
            <b>Your next career move</b>
            <p>Turn your skills into a plan.</p>
            <button onClick={() => setPage('Career Match')}>
              Explore career fit <ArrowUpRight size={14} />
            </button>
          </div>

          <button className={`nav-item ${page === 'Settings' ? 'active' : ''}`}
            onClick={() => setPage('Settings')}>
            <Settings size={18} /><span>Settings</span>
          </button>

          <div className="profile-mini">
            <div className="avatar">
              {(authUser.name || 'S').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div><b>{authUser.name || name}</b><small>{authUser.email}</small></div>
            <button className="logout-btn" onClick={logout}>Log out</button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobileOpen(true)}><Menu /></button>
          <div className="crumb">Workspace <span>/</span> <b>{page}</b></div>
          <div className="top-actions">
            <div className="status-pill">
              <span className="live-dot" /> {aiAnalysis ? 'AI analysis ready' : 'SkillTwin workspace'}
            </div>
            <button className="icon-btn" onClick={() => setPage('Career Match')}><Search size={18} /></button>
            <button className="icon-btn" onClick={() => setPage('Roadmap')}><Bell size={18} /></button>
            <button className="icon-btn" onClick={() => setPage('Settings')}><Settings size={18} /></button>
            <button className="avatar small-avatar" onClick={() => setPage('My SkillTwin')}>
              {(authUser.name || 'ST').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
            </button>
          </div>
        </header>

        <div className="content">
          {notice && (
            <div className="notice">
              <CheckCircle2 size={16} /> {notice}
              <button onClick={() => setNotice('')}>Dismiss</button>
            </div>
          )}

          {page === 'Overview' && <>
            <section className="welcome-row">
              <div>
                <div className="eyebrow"><Sparkles size={14} /> YOUR AI-POWERED CAREER COMPANION</div>
                <h1>Build your future with <span>clarity.</span></h1>
                <p className="subhead">Your skills, your gaps, your next move — all in one place.</p>
              </div>
              <button className="primary-btn" onClick={() => setPage('My SkillTwin')}>
                <BrainCircuit size={17} /> Update my profile
              </button>
            </section>

            <section className="hero-card">
              <div className="hero-copy">
                <div className="hero-tag"><span className="live-dot" /> SKILLTWIN INSIGHT</div>
                <h2>You’re closer than<br />you think.</h2>
                <p>Focus on the skills that matter for {role}.</p>
                <button className="hero-btn" onClick={() => setPage('Career Match')}>
                  View career match <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="hero-orbit">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="orbit-core"><BrainCircuit size={42} /><span>AI</span></div>
                <div className="orbit-node node-a"><CheckCircle2 size={16} /></div>
                <div className="orbit-node node-b"><Target size={16} /></div>
                <div className="orbit-node node-c"><Zap size={16} /></div>
              </div>
              <div className="hero-foot">
                <span><span className="tiny-dot" /> {aiAnalysis ? 'Based on your AI analysis' : 'Based on sample profile evidence'}</span>
                <span>Updated just now</span>
              </div>
            </section>

            <section className="metrics-grid">
              <div className="metric-card">
                <div className="metric-top"><span>Career readiness</span><Target size={17} /></div>
                <div className="score-row"><strong>{ready}%</strong><span className="positive">{aiAnalysis ? 'AI assessment' : 'Sample estimate'}</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${ready}%` }} /></div>
                <small>For {role}</small>
              </div>
              <div className="metric-card">
                <div className="metric-top"><span>Skills identified</span><BrainCircuit size={17} /></div>
                <div className="score-row"><strong>{skills.length}</strong><span className="muted">Core skills</span></div>
                <small>For your selected career</small>
              </div>
              <div className="metric-card">
                <div className="metric-top"><span>Skill gaps</span><Target size={17} /></div>
                <div className="score-row">
                  <strong>{aiAnalysis ? (aiAnalysis.skillGaps?.length || 0) : missing.length}</strong>
                  <span className="warning-text">Needs attention</span>
                </div>
                <div className="gap-chips">{missing.slice(0, 3).map(s => <span key={s.name}>{s.name}</span>)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-top"><span>Roadmap progress</span><Route size={17} /></div>
                <div className="score-row"><strong>{Math.round(completed / roadmap.length * 100)}%</strong><span className="muted">{completed} of {roadmap.length}</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${completed / roadmap.length * 100}%` }} /></div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div><h3><GitCompareArrows size={18} /> Compare careers</h3><p>Compare your selected career with another career.</p></div>
              </div>
              <div className="career-toolbar">
                <div><label>Your selected career</label><select value={role} onChange={e => changeRole(e.target.value)}>{Object.keys(careers).map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label>Compare with</label><select value={compareRole} onChange={e => setCompareRole(e.target.value)}>{Object.keys(careers).map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-top"><span>{role}</span><Target size={17} /></div>
                  <div className="score-row"><strong>{ready}%</strong><span className="muted">Readiness</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${ready}%` }} /></div>
                  <p>Missing skills: {missing.map(s => s.name).join(', ') || 'None'}</p>
                </div>
                <div className="metric-card">
                  <div className="metric-top"><span>{compareRole}</span><Target size={17} /></div>
                  <div className="score-row"><strong>{compareReady}%</strong><span className="muted">Sample estimate</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${compareReady}%` }} /></div>
                </div>
              </div>
              <p className="disclaimer">Comparisons are sample estimates unless you run an AI assessment.</p>
            </section>
          </>}

          {page === 'My SkillTwin' && <>
            <section className="page-title">
              <div className="eyebrow"><UserRound size={14} /> YOUR PROFILE</div>
              <h1>Meet your <span>SkillTwin.</span></h1>
              <p className="subhead">Manage your resume, skills, projects, courses, certificates and experience.</p>
            </section>

            <div className="panel form-panel">
              <h3>Student profile</h3>

              <label>Your name
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
              </label>

              <label>Target career
                <select value={role} onChange={e => changeRole(e.target.value)}>
                  {Object.keys(careers).map(c => <option key={c}>{c}</option>)}
                </select>
              </label>

              <h3>Skills & links</h3>
              <label>Skills you have learned
                <textarea rows="3" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="Java, Spring Boot, SQL, React..." />
              </label>

              <label>GitHub profile URL
                <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/yourusername" />
              </label>

              <label>Portfolio URL
                <input type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://yourportfolio.com" />
              </label>

              <h3>Projects</h3>
              <label>Number of projects
                <select value={projects} onChange={e => setProjects(e.target.value)}>
                  <option value="0">0 projects</option>
                  <option value="1">1 project</option>
                  <option value="2">2 projects</option>
                  <option value="3">3 projects</option>
                  <option value="4+">4+ projects</option>
                </select>
              </label>

              <label>Project details (one project per line)
                <textarea rows="5" value={projectDetails} onChange={e => setProjectDetails(e.target.value)}
                  placeholder={'Tenant Management System | Spring Boot microservices and REST APIs | Java, Spring Boot, MySQL\nPortfolio Website | Responsive personal portfolio | React, CSS'} />
              </label>
              <p className="disclaimer">Format: Project name | Description | Technologies (comma-separated).</p>

              <h3>Courses</h3>
              <label>Courses completed (one per line)
                <textarea rows="3" value={coursesText} onChange={e => setCoursesText(e.target.value)}
                  placeholder={'Java Programming\nSpring Boot Fundamentals'} />
              </label>

              <h3>Certifications</h3>
              <label>Certifications (one per line)
                <textarea rows="3" value={certificationsText} onChange={e => setCertificationsText(e.target.value)}
                  placeholder={'AWS Cloud Practitioner\nJava Certification'} />
              </label>

              <h3>Internships & experience</h3>
              <label>Internships / work experience (one per line)
                <textarea rows="4" value={internshipsText} onChange={e => setInternshipsText(e.target.value)}
                  placeholder={'Java Developer Intern, Company, Mar 2024 - May 2024 | Built REST APIs using Spring Boot'} />
              </label>

              <label>Additional experience details
                <textarea rows="3" value={experienceText} onChange={e => setExperienceText(e.target.value)}
                  placeholder="Responsibilities, achievements and measurable results" />
              </label>

              <h3>Resume builder</h3>
              <p className="disclaimer">Fill in the sections, generate a text resume preview, then download it. Your profile fields are saved in this browser.</p>

              <label>Upload an existing resume (optional)
                <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleResumeUpload} />
              </label>

              {resumeFileName && (
                <p className="disclaimer">
                  Selected file: {resumeFileName}. This prototype records the filename; it does not parse the uploaded document.
                </p>
              )}

              <label>Professional summary
                <textarea rows="4" value={resumeSummary} onChange={e => setResumeSummary(e.target.value)}
                  placeholder="Write 2–4 lines about your experience, strengths and career goal." />
              </label>

              <label>Education
                <textarea rows="3" value={educationText} onChange={e => setEducationText(e.target.value)}
                  placeholder="Degree, college, graduation year, relevant coursework" />
              </label>

              <button className="primary-btn full-btn" onClick={saveSettings}>
                <CheckCircle2 size={16} /> Save student profile
              </button>

              <button className="primary-btn full-btn" onClick={buildResume}>
                <BriefcaseBusiness size={16} /> Generate resume preview
              </button>

              {resumePreview && <>
                <div className="ai-results">
                  <h3>Resume preview</h3>
                  <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'inherit' }}>{resumePreview}</pre>
                </div>
                <button className="primary-btn full-btn" onClick={downloadResume}>
                  <ArrowUpRight size={16} /> Download resume (.txt)
                </button>
              </>}

              <button className="primary-btn full-btn" disabled={aiBusy} onClick={runAiAnalysis}>
                <Sparkles size={16} /> {aiBusy ? 'Analysing your profile…' : 'Analyze my profile with AI'}
              </button>

              {aiError && <p className="auth-error">{aiError}</p>}

              {aiAnalysis && (
                <div className="ai-results">
                  <h3>AI career analysis</h3>
                  <p><b>Readiness:</b> {ready}%</p>
                  <p>{aiAnalysis.scoreExplanation}</p>
                  <h4>Strengths</h4>
                  <ul>{(aiAnalysis.strengths || []).map((s, i) => <li key={i}>{typeof s === 'string' ? s : s.skill || s.description || JSON.stringify(s)}</li>)}</ul>
                  <h4>Skill gaps</h4>
                  <ul>{(aiAnalysis.skillGaps || []).map((s, i) => <li key={i}>{typeof s === 'string' ? s : s.skill || s.name || JSON.stringify(s)}</li>)}</ul>
                  <h4>Next best action</h4>
                  <p>{typeof aiAnalysis.nextBestAction === 'string' ? aiAnalysis.nextBestAction : JSON.stringify(aiAnalysis.nextBestAction)}</p>
                </div>
              )}
            </div>
          </>}

          {page === 'Career Match' && <>
            <section className="page-title">
              <div className="eyebrow"><Target size={14} /> CAREER MATCH ENGINE</div>
              <h1>Know your <span>career fit.</span></h1>
              <p className="subhead">Compare your profile with the skills expected for your target role.</p>
            </section>

            <div className="career-toolbar panel">
              <div><label>Target career</label><select value={role} onChange={e => changeRole(e.target.value)}>{Object.keys(careers).map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="match-score"><span>Readiness estimate</span><b>{ready}%</b></div>
              <button className="primary-btn" disabled={aiBusy} onClick={runAiAnalysis}>
                <Sparkles size={16} /> {aiBusy ? 'Analysing…' : 'Refresh AI match'}
              </button>
            </div>

            <div className="panel">
              <h3>Skill-by-skill comparison</h3>
              {skills.map(s => (
                <div className="match-skill" key={s.name}>
                  <div className="skill-symbol">{s.icon}</div>
                  <div className="match-skill-main">
                    <div className="match-label">
                      <b>{s.name}</b>
                      <span className={`level ${s.level.toLowerCase().replace(' ', '-')}`}>{s.level}</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${s.score}%` }} /></div>
                    <small>{s.evidence}</small>
                  </div>
                </div>
              ))}
              <button className="primary-btn" onClick={() => setPage('Roadmap')}>
                Open career roadmap <ArrowUpRight size={15} />
              </button>
            </div>
          </>}

          {page === 'Roadmap' && <>
            <section className="page-title">
              <div className="eyebrow"><Route size={14} /> YOUR ACTION PLAN</div>
              <h1>Turn gaps into <span>growth.</span></h1>
              <p className="subhead">Choose your career and learning plan duration.</p>
            </section>

            <div className="career-toolbar panel">
              <div><label>Select career roadmap</label><select value={role} onChange={e => changeRole(e.target.value)}>{Object.keys(careers).map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label>Course duration</label><select value={roadmapWeeks} onChange={e => changeRoadmapDuration(e.target.value)}>{roadmapDurations.map(w => <option key={w} value={w}>{w} weeks</option>)}</select></div>
              <div className="match-score"><span>Steps completed</span><b>{completed}/{roadmap.length}</b></div>
            </div>

            <div className="roadmap-banner">
              <div>
                <span className="action-label">PERSONALIZED ROADMAP · {role.toUpperCase()}</span>
                <h2>Your {roadmapWeeks}-week learning plan.</h2>
                <p>{aiAnalysis ? 'Roadmap based on your AI assessment.' : 'Run AI analysis to personalize your learning plan.'}</p>
              </div>
              <div className="roadmap-completion">
                <b>{completed}/{roadmap.length}</b><span>steps complete</span>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${completed / roadmap.length * 100}%` }} /></div>
              </div>
            </div>

            <div className="panel roadmap-full">
              {roadmap.map((task, i) => (
                <div className="roadmap-task" key={`${role}-${roadmapWeeks}-${i}`}>
                  <div className={`task-number ${task.done ? 'task-done' : ''}`}>
                    {task.done ? <CheckCircle2 size={20} /> : String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="task-content">
                    <span className="action-label">{task.week} · {task.tag.toUpperCase()}</span>
                    <h3>{task.title}</h3>
                    <p>{task.detail}</p>
                    <div className="task-meta">
                      <span><Clock3 size={14} /> Suggested focus: 3–5 hours</span>
                      <span><BriefcaseBusiness size={14} /> Portfolio evidence</span>
                    </div>
                  </div>
                  <button className={`task-toggle ${task.done ? 'is-done' : ''}`} onClick={() => toggleTask(i)}>
                    {task.done
                      ? <><CheckCircle2 size={15} /> Completed</>
                      : <>Mark complete <ArrowUpRight size={14} /></>}
                  </button>
                </div>
              ))}
            </div>
          </>}

          {page === 'Settings' && <>
            <section className="page-title">
              <div className="eyebrow"><Settings size={14} /> PREFERENCES</div>
              <h1>Account <span>settings.</span></h1>
              <p className="subhead">Manage your profile and preferences.</p>
            </section>

            <div className="settings-grid">
              <section className="panel form-panel">
                <div className="panel-heading"><div><h3>Profile & career</h3><p>Personalize your workspace.</p></div><UserRound size={20} /></div>
                <label>Display name<input value={name} onChange={e => setName(e.target.value)} /></label>
                <label>Email address<input value={authUser.email || ''} disabled readOnly /></label>
                <label>Target career<select value={role} onChange={e => changeRole(e.target.value)}>{Object.keys(careers).map(c => <option key={c}>{c}</option>)}</select></label>
                <button className="primary-btn full-btn" onClick={saveSettings}><CheckCircle2 size={16} /> Save settings</button>
              </section>

              <section className="panel form-panel">
                <div className="panel-heading"><div><h3>Change password</h3><p>Choose a new password.</p></div><LockKeyhole size={20} /></div>
                <form onSubmit={changePassword}>
                  <label>Current password<input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label>
                  <label>New password<input type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} /></label>
                  <label>Confirm new password<input type="password" required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></label>
                  <button className="primary-btn full-btn" disabled={passwordBusy}>
                    <LockKeyhole size={16} /> {passwordBusy ? 'Changing…' : 'Change password'}
                  </button>
                </form>
                <p className="disclaimer">Requires a working password-change endpoint.</p>
              </section>

              <section className="panel form-panel">
                <div className="panel-heading"><div><h3>Learning preferences</h3><p>Choose reminder preferences.</p></div><Bell size={20} /></div>
                <div className="setting-toggle">
                  <div><b>Weekly learning reminders</b><small>Save your preference.</small></div>
                  <input type="checkbox" checked={weeklyReminders} onChange={e => setWeeklyReminders(e.target.checked)} />
                </div>
                <div className="setting-toggle">
                  <div><b>Progress notifications</b><small>Show progress notices.</small></div>
                  <input type="checkbox" checked={progressNotifications} onChange={e => setProgressNotifications(e.target.checked)} />
                </div>
                <button className="primary-btn full-btn" onClick={saveSettings}>Save preferences</button>
                <p className="disclaimer">Preferences are saved in this browser.</p>
              </section>

              <section className="panel form-panel">
                <h3>Account</h3>
                <p>End your current session.</p>
                <button className="outline-btn full-btn" onClick={logout}>Log out</button>
              </section>
            </div>
          </>}

          <AIChatWidget profile={aiProfile} analysis={aiAnalysis} />
          <footer className="footer">
            <span>© 2026 SkillTwin · Team ZeroDay</span>
            <span><span className="live-dot" /> Hackathon prototype</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);