/* ============================================================
   ALL-JOB RESUME ANALYZER ENGINE
   Supports: PDF (PDF.js), DOCX (Mammoth.js), TXT, plain paste
   15 Job Roles | Real Scoring | Matched/Missing Skills
   ============================================================ */
(function () {

  /* ── PDF.js worker ── */
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  /* ── Sample Resume ── */
  const SAMPLE = `Priya Sharma
Email: priya.sharma@gmail.com | Phone: +91 98765 43210 | LinkedIn: linkedin.com/in/priyasharma | GitHub: github.com/priyasharma
Location: Bangalore, India

PROFESSIONAL SUMMARY
Results-driven Full Stack Developer with 3+ years of experience building scalable web applications using React, Node.js and AWS. Proven track record delivering high-quality software in agile environments.

EXPERIENCE
Senior Frontend Developer — TechCorp India (Jan 2022 – Present)
• Developed 15+ responsive web apps using React.js and TypeScript
• Reduced page load time by 40% via code splitting and lazy loading
• Mentored 3 junior developers and conducted code reviews

Junior Web Developer — StartupXYZ (Jun 2020 – Dec 2021)
• Built REST APIs with Node.js and Express serving 50,000+ daily users
• Integrated Razorpay, Stripe, SendGrid APIs
• Implemented CI/CD pipelines with GitHub Actions

EDUCATION
B.Tech Computer Science — VIT University, Vellore (2016–2020) CGPA: 8.7/10

SKILLS
JavaScript, TypeScript, React.js, Node.js, Python, SQL, MongoDB, PostgreSQL, AWS, Docker, Kubernetes, Git, Figma

CERTIFICATIONS
• AWS Certified Solutions Architect (2023)
• Google Professional Cloud Developer (2022)

PROJECTS
E-Commerce Platform | github.com/priyasharma/ecomm
Full-stack platform with React and Node.js supporting 10,000+ products.

ACHIEVEMENTS
• Winner – HackIndia 2022 | Forbes 30 Under 30 Technology 2024`;

  /* ── Job Profiles ── */
  const JOBS = {
    software_dev: {
      label: '💻 Software Developer',
      skills: ['javascript','python','java','c++','c#','react','angular','vue','node','express','spring','django','sql','mongodb','postgresql','git','docker','kubernetes','aws','azure','gcp','rest api','graphql','microservices','agile','scrum','oop','data structures','algorithms','ci/cd','linux','redis','typescript'],
      sections: ['experience','skills','projects','education'],
      atsWords: ['developed','built','optimized','deployed','architected','scaled','reduced','improved','led','designed','integrated','automated'],
      tips: ['Add GitHub profile link with project links','Quantify impact: "Reduced load time by 40%"','List programming languages prominently','Include open-source contributions','Add system design experience for senior roles'],
      keywords: ['system design','microservices','cloud native','devops','api design','performance optimization','code review','unit testing']
    },
    web_dev: {
      label: '🌐 Web Developer',
      skills: ['html','css','javascript','react','vue','angular','typescript','tailwind','bootstrap','sass','php','wordpress','node','express','rest api','graphql','figma','git','responsive design','web performance','seo','accessibility','webpack','vite','next.js','nuxt'],
      sections: ['experience','skills','projects','portfolio'],
      atsWords: ['built','designed','developed','responsive','optimized','deployed','maintained','integrated','created','launched'],
      tips: ['Add portfolio URL with live project links','Show before/after performance metrics','Mention browser compatibility experience','Include CMS experience (WordPress, Webflow)','Add mobile-first design experience'],
      keywords: ['core web vitals','lighthouse score','cross-browser','pwa','jamstack','headless cms','web accessibility','wcag']
    },
    aiml: {
      label: '🤖 AI/ML Engineer',
      skills: ['python','tensorflow','pytorch','scikit-learn','keras','nlp','computer vision','deep learning','machine learning','pandas','numpy','matplotlib','jupyter','sql','spark','hadoop','aws sagemaker','mlflow','docker','git','statistics','linear algebra','neural networks','transformers','llm','langchain','rag','hugging face'],
      sections: ['experience','skills','projects','publications','education'],
      atsWords: ['trained','fine-tuned','deployed','optimized','achieved','improved','researched','developed','built','implemented'],
      tips: ['Link to Kaggle profile or competition results','Add model accuracy/F1 metrics to projects','Include dataset sizes you worked with','Mention MLOps/model deployment experience','Add publications or research papers if any'],
      keywords: ['mlops','model deployment','feature engineering','hyperparameter tuning','a/b testing','data pipeline','model monitoring','responsible ai']
    },
    digital_marketing: {
      label: '📣 Digital Marketing',
      skills: ['seo','sem','google ads','facebook ads','instagram ads','email marketing','content marketing','social media','google analytics','meta ads','hubspot','mailchimp','canva','copywriting','ppc','cro','a/b testing','affiliate marketing','influencer marketing','crm','salesforce','keyword research','link building'],
      sections: ['experience','skills','certifications','campaigns'],
      atsWords: ['grew','increased','reduced','managed','launched','optimized','generated','achieved','drove','improved'],
      tips: ['Add specific ROAS/ROI numbers from campaigns','Include Google/Meta certifications','Show follower growth percentages','Mention monthly ad spend managed','Add email open rate and CTR metrics'],
      keywords: ['roas','cpa','ctr','conversion rate','funnel optimization','retargeting','lookalike audience','brand awareness','lead generation']
    },
    graphic_designer: {
      label: '🎨 Graphic Designer',
      skills: ['photoshop','illustrator','figma','adobe xd','indesign','canva','after effects','premiere pro','coreldraw','typography','branding','logo design','ui/ux','color theory','motion graphics','print design','packaging','social media design','sketch','procreate'],
      sections: ['experience','skills','portfolio','tools'],
      atsWords: ['designed','created','developed','collaborated','delivered','produced','crafted','built','conceptualized'],
      tips: ['Always include portfolio URL (Behance/Dribbble)','List all Adobe Creative Cloud tools used','Mention client industries served','Include brand identity projects','Add number of assets designed per project'],
      keywords: ['brand identity','visual communication','design system','style guide','grid layout','color palette','user experience','creative direction']
    },
    sales: {
      label: '💼 Sales Executive',
      skills: ['cold calling','lead generation','crm','salesforce','negotiation','b2b sales','b2c sales','account management','pipeline management','objection handling','client acquisition','revenue target','forecasting','upselling','cross-selling','zoho crm','hubspot','presentation','relationship management'],
      sections: ['experience','achievements','skills','education'],
      atsWords: ['achieved','exceeded','generated','closed','acquired','built','managed','grew','increased','led'],
      tips: ['Always show revenue numbers: "Closed ₹50L in Q3"','Show % of target achieved each year','Add number of clients managed','Mention industry verticals you sold to','Include average deal size and sales cycle'],
      keywords: ['quota achievement','revenue growth','client retention','pipeline value','deal closure','territory management','sales funnel','key accounts']
    },
    hr: {
      label: '👥 HR Executive',
      skills: ['recruitment','talent acquisition','onboarding','payroll','performance management','employee relations','hrms','hris','workday','sap hr','labor law','training','learning & development','compensation','benefits','exit interviews','hr analytics','kpi','succession planning','compliance'],
      sections: ['experience','skills','certifications','education'],
      atsWords: ['recruited','managed','implemented','developed','conducted','maintained','reduced','improved','handled','led'],
      tips: ['Add time-to-hire metrics','Show attrition rate improvements','Mention bulk hiring numbers','Include HRMS tools used','Add certifications like SHRM or PHR'],
      keywords: ['talent pipeline','employer branding','candidate experience','offer to joining ratio','headcount planning','workforce planning','hr policies','organizational development']
    },
    data_analyst: {
      label: '📊 Data Analyst',
      skills: ['sql','python','r','excel','tableau','power bi','google data studio','pandas','numpy','statistics','data visualization','data cleaning','etl','big data','spark','hadoop','mysql','postgresql','looker','dax','pivot tables','vlookup','a/b testing','business intelligence','dashboards'],
      sections: ['experience','skills','projects','education'],
      atsWords: ['analyzed','visualized','built','created','reduced','improved','identified','reported','extracted','transformed'],
      tips: ['Add specific business impact from your analysis','Include dashboard links if possible','Show dataset sizes worked with (millions of rows)','Mention stakeholder reporting experience','Add SQL query optimization examples'],
      keywords: ['data-driven decisions','kpi tracking','trend analysis','root cause analysis','predictive analytics','data governance','storytelling with data','executive reporting']
    },
    customer_support: {
      label: '🎧 Customer Support',
      skills: ['customer service','zendesk','freshdesk','salesforce service cloud','crm','ticket management','sla','escalation','live chat','email support','phone support','problem solving','empathy','product knowledge','knowledge base','csat','nps','conflict resolution','multitasking','communication'],
      sections: ['experience','skills','education'],
      atsWords: ['resolved','handled','managed','improved','maintained','achieved','reduced','assisted','supported','escalated'],
      tips: ['Add CSAT score or NPS rating you maintained','Show ticket resolution time','Mention upsell/retention success','Include volume handled (tickets/day)','Add any team lead or mentoring experience'],
      keywords: ['first contact resolution','average handle time','customer satisfaction','retention rate','ticket queue','support metrics','customer success','sla compliance']
    },
    teacher: {
      label: '📚 Teacher',
      skills: ['lesson planning','curriculum development','classroom management','assessment','differentiated instruction','lms','google classroom','zoom','student engagement','parent communication','special needs','ib curriculum','cbse','icse','ed-tech','microsoft teams','content creation','mentoring','subject expertise'],
      sections: ['experience','education','skills','certifications'],
      atsWords: ['taught','developed','designed','improved','managed','mentored','created','delivered','assessed','implemented'],
      tips: ['Mention subject specialization and grade levels','Add student result improvement percentages','Include curriculum design projects','Add tech tools used for online teaching','Mention any awards or recognitions received'],
      keywords: ['student outcomes','academic performance','inclusive education','blended learning','formative assessment','project-based learning','flipped classroom','professional development']
    },
    accountant: {
      label: '🧾 Accountant',
      skills: ['tally','gst','tds','income tax','balance sheet','p&l','accounts payable','accounts receivable','budgeting','forecasting','audit','ifrs','ind as','excel','sap','quickbooks','zoho books','financial reporting','cost accounting','variance analysis','bank reconciliation','taxation'],
      sections: ['experience','skills','certifications','education'],
      atsWords: ['managed','prepared','filed','reconciled','audited','reduced','improved','processed','maintained','reported'],
      tips: ['Add CA/CMA/CPA certification if applicable','Show cost savings achieved','Mention company turnover handled','Include ERP software experience (SAP, Oracle)','Add number of clients managed if in CA firm'],
      keywords: ['financial compliance','statutory audit','internal controls','tax planning','cash flow management','month-end closing','accounts reconciliation','financial statements']
    },
    civil_engineer: {
      label: '🏗️ Civil Engineer',
      skills: ['autocad','staad pro','revit','civil 3d','ms project','primavera','structural analysis','rcc design','construction management','site supervision','quantity surveying','estimation','tendering','bim','quality control','safety management','survey','soil testing','project planning','contract management'],
      sections: ['experience','skills','projects','education','certifications'],
      atsWords: ['managed','designed','supervised','completed','delivered','reduced','improved','constructed','planned','coordinated'],
      tips: ['Mention project value/size in crores','Add project completion timeline adherence','Include safety record (zero-accident days)','Show team size managed on site','Add certifications like PMP or NICMAR'],
      keywords: ['project delivery','cost control','resource planning','rcc design','structural integrity','bim modeling','construction schedule','quality assurance']
    },
    mechanical_engineer: {
      label: '⚙️ Mechanical Engineer',
      skills: ['solidworks','catia','ansys','autocad','creo','nx','manufacturing','cnc','lean manufacturing','six sigma','quality control','thermodynamics','fluid mechanics','fea','cad/cam','production planning','supply chain','gd&t','kaizen','5s','iso standards','product design','tolerance analysis'],
      sections: ['experience','skills','projects','education','certifications'],
      atsWords: ['designed','developed','optimized','reduced','improved','manufactured','tested','managed','implemented','analyzed'],
      tips: ['Add Six Sigma/Lean certification if available','Show cost reduction achievements','Mention production efficiency improvements','Include 3D modeling portfolio if possible','Add patents or innovations developed'],
      keywords: ['design for manufacturing','tolerance stack-up','root cause analysis','failure mode analysis','continuous improvement','oee improvement','product lifecycle','value engineering']
    },
    electrical_engineer: {
      label: '⚡ Electrical Engineer',
      skills: ['plc','scada','hmi','autocad electrical','eplan','electrical drawings','panel design','power systems','vfd','servo drives','transformer','switchgear','relay protection','power distribution','energy audit','solar','ups','dcs','instrumentation','p&id','electrical estimation','iec standards'],
      sections: ['experience','skills','projects','education','certifications'],
      atsWords: ['designed','installed','commissioned','maintained','tested','managed','reduced','improved','implemented','optimized'],
      tips: ['Mention voltage levels worked with (LT/HT/EHV)','Add energy savings achieved in kWh or %','Include commissioning project experience','Mention industries served (oil & gas, manufacturing)','Add relevant certifications (CBIP, CPEE)'],
      keywords: ['power factor correction','load flow analysis','protection coordination','arc flash study','energy management','electrical safety','commissioning','substation design']
    },
    fresher: {
      label: '🌱 Fresher / Internship',
      skills: ['communication','teamwork','problem solving','ms office','excel','powerpoint','leadership','time management','adaptability','critical thinking','presentation','research','data entry','social media','basic programming','html','python','java','c','mathematics','analytical skills'],
      sections: ['education','projects','internships','certifications','skills','extracurricular'],
      atsWords: ['completed','developed','participated','achieved','presented','created','led','organized','contributed','learned'],
      tips: ['Add all internship experiences even if short','List academic projects with tech used','Include extracurricular leadership roles','Add online certifications (Coursera, NPTEL)','Show CGPA prominently if above 7.5'],
      keywords: ['quick learner','self-motivated','team player','eager to learn','academic projects','college fest','national service scheme','student council']
    }
  };

  /* ── DOM refs ── */
  const textarea   = document.getElementById('resume-text-input');
  const charCount  = document.getElementById('resume-char-count');
  const analyzeBtn = document.getElementById('resume-analyze-btn');
  const btnText    = document.getElementById('rc-btn-text');
  const sampleBtn  = document.getElementById('resume-sample-btn');
  const resetBtn   = document.getElementById('resume-reset-btn');
  const dropZone   = document.getElementById('resume-drop-zone');
  const fileInput  = document.getElementById('resume-file-input');
  const dropTitle  = document.getElementById('rc-drop-title');
  const clearBtn   = document.getElementById('rc-clear-btn');
  const jobSelect  = document.getElementById('rc-job-select');
  const placeholder= document.getElementById('resume-placeholder');
  const results    = document.getElementById('resume-results');

  /* ── Char counter ── */
  textarea.addEventListener('input', () => {
    charCount.textContent = textarea.value.length.toLocaleString() + ' characters';
  });

  /* ── Clear ── */
  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    charCount.textContent = '0 characters';
    dropTitle.textContent = 'Drag & drop resume here';
    fileInput.value = '';
  });

  /* ── Sample ── */
  sampleBtn.addEventListener('click', () => {
    textarea.value = SAMPLE;
    charCount.textContent = SAMPLE.length.toLocaleString() + ' characters';
    if (!jobSelect.value) jobSelect.value = 'software_dev';
  });

  /* ── Drag & Drop ── */
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => fileInput.files[0] && handleFile(fileInput.files[0]));

  /* ── File Handler ── */
  function handleFile(file) {
    if (!file) return;
    const name = file.name.toLowerCase();
    dropTitle.textContent = '📎 ' + file.name;
    if (name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = e => setResume(e.target.result);
      reader.readAsText(file);
    } else if (name.endsWith('.pdf')) {
      extractPDF(file);
    } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
      extractDOCX(file);
    } else {
      alert('Supported formats: PDF, DOCX, DOC, TXT');
    }
  }

  function setResume(text) {
    textarea.value = text;
    charCount.textContent = text.length.toLocaleString() + ' characters';
  }

  function extractPDF(file) {
    if (typeof pdfjsLib === 'undefined') { alert('PDF.js not loaded. Please paste resume text.'); return; }
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(s => s.str).join(' ') + '\n';
        }
        setResume(text.trim());
      } catch (err) { alert('Could not read PDF. Try pasting text instead.'); }
    };
    reader.readAsArrayBuffer(file);
  }

  function extractDOCX(file) {
    if (typeof mammoth === 'undefined') { alert('Mammoth.js not loaded. Please paste resume text.'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      mammoth.extractRawText({ arrayBuffer: e.target.result })
        .then(r => setResume(r.value.trim()))
        .catch(() => alert('Could not read DOC/DOCX. Try pasting text instead.'));
    };
    reader.readAsArrayBuffer(file);
  }

  /* ── Reset ── */
  resetBtn && resetBtn.addEventListener('click', () => {
    textarea.value = '';
    charCount.textContent = '0 characters';
    dropTitle.textContent = 'Drag & drop resume here';
    fileInput.value = '';
    placeholder.style.display = '';
    results.style.display = 'none';
    jobSelect.value = '';
  });

  /* ── ANALYZE ── */
  analyzeBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    const job  = jobSelect.value;
    if (!text || text.length < 50) {
      textarea.style.borderColor = 'rgba(255,80,80,0.6)';
      setTimeout(() => textarea.style.borderColor = '', 1500);
      textarea.focus(); return;
    }
    if (!job) {
      jobSelect.style.borderColor = 'rgba(255,80,80,0.6)';
      setTimeout(() => jobSelect.style.borderColor = '', 1500);
      jobSelect.focus(); return;
    }
    analyzeBtn.disabled = true;
    btnText.textContent = '⏳ Analyzing...';
    setTimeout(() => {
      const data = analyze(text, job);
      renderResults(data);
      analyzeBtn.disabled = false;
      btnText.textContent = 'Analyze My Resume';
    }, 1000);
  });

  /* ══════════════════════════════════════
     SCORING ENGINE
  ══════════════════════════════════════ */
  function analyze(rawText, jobKey) {
    const t    = rawText.toLowerCase();
    const job  = JOBS[jobKey];
    const words= rawText.split(/\s+/).filter(Boolean).length;
    const lines= rawText.split('\n').filter(l => l.trim());

    /* ── 1. Job Skills Match (35 pts) ── */
    const matched = job.skills.filter(s => t.includes(s));
    const missing  = job.skills.filter(s => !t.includes(s));
    const skillScore = Math.min(Math.round((matched.length / job.skills.length) * 35), 35);

    /* ── 2. Contact Info (15 pts) ── */
    let contact = 0;
    if (/[\w.-]+@[\w.-]+\.\w{2,}/.test(rawText)) contact += 5;
    if (/(\+?\d[\d\s\-(). ]{7,}\d)/.test(rawText)) contact += 4;
    if (/linkedin\.com/.test(t)) contact += 3;
    if (/github\.com|portfolio|behance|dribbble/.test(t)) contact += 3;
    contact = Math.min(contact, 15);

    /* ── 3. Sections Completeness (20 pts) ── */
    const sectionScore = job.sections.reduce((acc, sec) => {
      return acc + (t.includes(sec) ? Math.round(20 / job.sections.length) : 0);
    }, 0);

    /* ── 4. ATS Power Words (15 pts) ── */
    const atsFound = job.atsWords.filter(w => t.includes(w));
    let atsScore = Math.min(Math.round((atsFound.length / job.atsWords.length) * 12), 12);
    if (/(summary|objective|profile)/i.test(rawText)) atsScore += 3;
    atsScore = Math.min(atsScore, 15);

    /* ── 5. Format & Length (15 pts) ── */
    let fmt = 0;
    if (words >= 200 && words <= 800) fmt += 5; else if (words >= 100) fmt += 2;
    if (lines.length >= 20) fmt += 3;
    const bullets = (rawText.match(/^[\s]*[•\-*►]/gm) || []).length;
    fmt += Math.min(bullets * 0.5, 4);
    if (/\d{4}[\s\-–—]+(\d{4}|present|current)/i.test(rawText)) fmt += 3;
    fmt = Math.min(Math.round(fmt), 15);

    const total = skillScore + contact + Math.min(sectionScore, 20) + atsScore + fmt;

    /* ── Tips ── */
    const tips = [...job.tips];
    if (!(/[\w.-]+@[\w.-]+\.\w{2,}/.test(rawText))) tips.unshift('❌ Add your email address — essential for recruiters.');
    if (!(/linkedin\.com/.test(t))) tips.unshift('💼 Add LinkedIn profile URL to boost credibility.');
    if (bullets < 4) tips.push('📌 Use bullet points (•) for each job role for better readability.');
    if (!/(summary|objective|profile)/i.test(rawText)) tips.push('📝 Add a 2-3 line Professional Summary at the top.');
    if (words < 200) tips.push('📏 Resume too short — expand experience/projects sections.');

    /* ── Recommended keywords ── */
    const recKeywords = job.keywords || [];

    return {
      total, skillScore, contact,
      sectionScore: Math.min(sectionScore, 20),
      atsScore, fmt,
      matched, missing: missing.slice(0, 12),
      tips: tips.slice(0, 7),
      recKeywords,
      jobLabel: job.label
    };
  }

  /* ══════════════════════════════════════
     RENDER RESULTS
  ══════════════════════════════════════ */
  function renderResults(d) {
    placeholder.style.display = 'none';
    results.style.display = '';

    /* Grade */
    const s = d.total;
    let grade, gc, desc;
    if (s >= 85)      { grade='⭐ Excellent'; gc='#10b981'; desc='Recruiter-ready! Outstanding match.'; }
    else if (s >= 70) { grade='👍 Good';      gc='#6366f1'; desc='Strong resume with minor gaps.'; }
    else if (s >= 55) { grade='⚠️ Average';   gc='#f59e0b'; desc='Decent — a few key areas need work.'; }
    else if (s >= 35) { grade='🔧 Needs Work'; gc='#f97316'; desc='Significant improvements needed.'; }
    else              { grade='❌ Weak';       gc='#ef4444'; desc='Major sections missing.'; }

    /* Score ring animation */
    const ring = document.getElementById('score-ring-fill');
    const circ = 2 * Math.PI * 58;
    ring.style.strokeDasharray = circ;
    ring.style.stroke = gc;
    const numEl = document.getElementById('overall-score-number');
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + s / 60, s);
      numEl.textContent = Math.round(cur);
      ring.style.strokeDashoffset = circ - (cur / 100) * circ;
      if (cur >= s) clearInterval(timer);
    }, 16);

    /* Grade pill */
    const pill = document.getElementById('score-grade-badge');
    pill.textContent = grade;
    pill.style.cssText = `background:${gc}22;color:${gc};border:1px solid ${gc}44;`;

    document.getElementById('score-label-text').textContent = s >= 70 ? 'Looking Great! 🎉' : 'Room to Improve!';
    document.getElementById('score-label-desc').textContent = desc;

    const roleLabel = document.getElementById('rc-job-role-label');
    if (roleLabel) roleLabel.textContent = 'Role: ' + d.jobLabel;

    /* Matched skills */
    const matchedEl = document.getElementById('matched-skills');
    if (matchedEl) matchedEl.innerHTML = d.matched.slice(0,14).map(s =>
      `<span class="skill-chip skill-match">${s}</span>`).join('') || '<span class="skill-chip-empty">None found</span>';

    /* Missing skills */
    const missingEl = document.getElementById('missing-skills');
    if (missingEl) missingEl.innerHTML = d.missing.map(s =>
      `<span class="skill-chip skill-miss">${s}</span>`).join('') || '<span class="skill-chip-empty">All covered! 🎉</span>';

    /* Category bars */
    const cats = [
      { name:'Job Skills Match', score:d.skillScore,    max:35, icon:'⚡', color:'#a855f7' },
      { name:'Contact Info',     score:d.contact,       max:15, icon:'📞', color:'#06b6d4' },
      { name:'Resume Sections',  score:d.sectionScore,  max:20, icon:'📋', color:'#6366f1' },
      { name:'ATS Power Words',  score:d.atsScore,      max:15, icon:'🎯', color:'#f59e0b' },
      { name:'Format & Length',  score:d.fmt,           max:15, icon:'📐', color:'#10b981' },
    ];
    const catEl = document.getElementById('score-categories');
    catEl.innerHTML = '';
    cats.forEach((c, i) => {
      const pct = Math.round((c.score / c.max) * 100);
      const div = document.createElement('div');
      div.className = 'rc-cat-item';
      div.style.animationDelay = (i * 0.07) + 's';
      div.innerHTML = `<div class="rc-cat-header"><span>${c.icon}</span><span class="rc-cat-name">${c.name}</span><span style="color:${c.color};font-weight:700;font-size:.82rem;">${c.score}/${c.max}</span></div>
        <div class="rc-bar-track"><div class="rc-bar-fill" style="width:0%;background:${c.color}" data-w="${pct}"></div></div>`;
      catEl.appendChild(div);
    });
    setTimeout(() => {
      document.querySelectorAll('.rc-bar-fill').forEach(b => {
        b.style.transition = 'width .8s cubic-bezier(.4,0,.2,1)';
        b.style.width = b.dataset.w + '%';
      });
    }, 100);

    /* Recommended keywords */
    const kwEl = document.getElementById('rc-keywords-list');
    if (kwEl && d.recKeywords.length) {
      kwEl.innerHTML = d.recKeywords.map(k => `<span class="rc-kw-chip">${k}</span>`).join('');
    }

    /* Tips */
    document.getElementById('tips-list').innerHTML =
      d.tips.map(t => `<li class="rc-tip-item">${t}</li>`).join('');

    results.closest('.rc-results-card').scrollIntoView({ behavior:'smooth', block:'start' });
  }

})();
