/* =============================================================================
   BADAR EXPO SOLUTIONS - EXHIBITION MANAGEMENT PAGE JAVASCRIPT (exhibitionmanagement.js)
   ============================================================================= */

// ========================= EXHIBITION MANAGEMENT: HERO INTERACTIVE FLOOR MAP =========================
const EmFloorMapManager = {
    init() {
        const mapZones = document.querySelectorAll('#em-page .map-zone');
        const tickerLog = document.getElementById('tickerLog');
        const zoneInfoText = document.getElementById('zoneInfoText');
        if (!mapZones.length || !tickerLog || !zoneInfoText) return;

        const zoneData = {
            stage: {
                log: "CONNECTED: PLENARY STAGE MONITORS ACTIVE",
                desc: "Primary auditorium setup for international summits and panels. Active audio-visual link monitoring enabled with 12-channel line array calibration."
            },
            halla: {
                log: "CONNECTED: EXHIBITION PAVILION A SIGNAL OK",
                desc: "Allotment grid for tech pavilions and country booths. Displays live crowd density maps and smart climate sensors feedback."
            },
            hallb: {
                log: "CONNECTED: EXHIBITION PAVILION B SYSTEM OK",
                desc: "Heavy industrial and logistics booths grid. Supports machinery setups, reinforced load capacities, and automated guide loops."
            },
            lounge: {
                log: "CONNECTED: VIP LOUNGE ACCESS SECURE",
                desc: "Restricted matchmaking chamber for diplomatic summits and B2B delegate agendas. Features soundproofing and secure network bridges."
            }
        };

        mapZones.forEach(zone => {
            zone.addEventListener('mouseenter', () => {
                mapZones.forEach(z => z.classList.remove('active'));
                zone.classList.add('active');

                const zoneKey = zone.getAttribute('data-zone');
                const info = zoneData[zoneKey];
                if (info) {
                    tickerLog.textContent = info.log;
                    zoneInfoText.textContent = info.desc;
                }
            });
        });
    }
};

// ========================= EXHIBITION MANAGEMENT: INTERACTIVE OPERATIONS LIFECYCLE =========================
const EmLifecycleManager = {
    init() {
        const lifecycleNodes = document.querySelectorAll('#em-page .lifecycle-node');
        const lifecycleIcon = document.getElementById('lifecycleIcon');
        const lifecycleTitle = document.getElementById('lifecycleTitle');
        const lifecycleDesc = document.getElementById('lifecycleDesc');
        const lifecycleTask = document.getElementById('lifecycleTask');
        const lifecycleTech = document.getElementById('lifecycleTech');
        if (!lifecycleNodes.length) return;

        const stepDetails = {
            "1": {
                title: "1. Client Brief & Requirements Consultation",
                icon: "fa-comments",
                desc: "Initial consult meetings to define event scope, space grids, thematic zones, visitor targets, and budgetary constraints.",
                task: "Consultation & Scope",
                tech: "BXSS Client Portal"
            },
            "2": {
                title: "2. Floor Plan Blueprint Designing",
                icon: "fa-drafting-compass",
                desc: "Drafting CAD layout blueprints detailing coordinator stands, emergency exits, electrical lines, and catering zones.",
                task: "AutoCAD Space Grid Layouts",
                tech: "CAD Floor Mapper"
            },
            "3": {
                title: "3. Government & Regulatory Approvals",
                icon: "fa-file-shield",
                desc: "Managing legal clearance files, structural safety audit certificates, police protocol logs, and health board stamps.",
                task: "NOCs & Permit Clearance",
                tech: "BXSS Regulatory Portal"
            },
            "4": {
                title: "4. Custom Stall Construction & Fabrication",
                icon: "fa-hammer",
                desc: "In-house manufacturing of custom wood booths, branded octanorms, and hanging signs at our state-of-the-art facility.",
                task: "Stall Build & Graphics",
                tech: "BXSS Production Workshop"
            },
            "5": {
                title: "5. Smart Visitor Registration Portal",
                icon: "fa-user-plus",
                desc: "Designing visitor landing portals and barcode badge printing systems to ensure smooth check-in.",
                task: "Pre-Reg Database Synced",
                tech: "BXSS Ticket Engine"
            },
            "6": {
                title: "6. Venue Shell Setup & Branding",
                icon: "fa-palette",
                desc: "Mounting custom banners, entrance panels, directional kiosks, safety guidelines, and registration desks.",
                task: "Venue Dress-up",
                tech: "Print Production Center"
            },
            "7": {
                title: "7. Audio-Visual & Systems Sound Rehearsal",
                icon: "fa-volume-high",
                desc: "Sound tuning for keynotes, testing LED walls, calibrating projection arrays, and setting translation lines.",
                task: "Live Cue Direction",
                tech: "Event Command Dashboard"
            },
            "8": {
                title: "8. Continuous Monitoring",
                icon: "fa-desktop",
                desc: "Tracking live stats including entrance queue volumes, network bandwidth usage, VIP safety statuses, and booth request sheets.",
                task: "Traffic Monitoring",
                tech: "Sensors Feed Hub"
            },
            "9": {
                title: "9. Pipeline Business Reporting",
                icon: "fa-chart-pie",
                desc: "Delivering structural audit files, visitor count records, media placement reports, and exhibitor pipeline reviews.",
                task: "Data Analysis",
                tech: "Analytics Reporter"
            }
        };

        lifecycleNodes.forEach(node => {
            node.addEventListener('click', () => {
                lifecycleNodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');

                const step = node.getAttribute('data-step');
                const details = stepDetails[step];
                if (details) {
                    lifecycleIcon.innerHTML = '<i class="fas ' + details.icon + '"></i>';
                    lifecycleTitle.textContent = details.title;
                    lifecycleDesc.textContent = details.desc;
                    lifecycleTask.textContent = details.task;
                    lifecycleTech.textContent = details.tech;
                }
            });
        });
    }
};

// ========================= EXHIBITION MANAGEMENT: EVENT CONTROL PANEL INTERACTIVE LOGS =========================
const EmControlPanelLogManager = {
    init() {
        const consoleTabs = document.querySelectorAll('#em-page .console-tab');
        const consoleTeamTitle = document.getElementById('consoleTeamTitle');
        const consoleTeamDesc = document.getElementById('consoleTeamDesc');
        const consoleTeamStatus = document.getElementById('consoleTeamStatus');
        const consoleTeamTasks = document.getElementById('consoleTeamTasks');
        const consoleTeamLogs = document.getElementById('consoleTeamLogs');
        const consoleTeamLead = document.getElementById('consoleTeamLead');
        if (!consoleTabs.length) return;

        const divisionData = {
            ops: {
                title: "Operations Control Team",
                desc: "Manages floor logistics, exhibitor support requests, and coordinator assignments.",
                status: "Active",
                lead: "Kamran Ahmed",
                tasks: [
                    "Pre-event floor mapping and exhibitor booth placement verification.",
                    "On-site coordinator tracking and zone task allocation.",
                    "Exhibitor technical request escalation and logistics solving."
                ],
                logs: [
                    { time: "[14:32:05]", text: "Floor sweep completed in Pavilion Hall A." },
                    { time: "[14:35:12]", text: "Exhibitor booth B24 electrical supply restored." },
                    { time: "[14:40:00]", text: "Visitor traffic reporting optimal." }
                ]
            },
            tech: {
                title: "Technical & AV Division",
                desc: "Maintains network links, audio calibrations, screen projections, and translation lines.",
                status: "Monitoring",
                lead: "Imran Qureshi",
                tasks: [
                    "12-channel line array calibration and sound check verification.",
                    "Direct live streaming server link configuration and backup routing.",
                    "On-stage projection screen sync and lighting controller sweeps."
                ],
                logs: [
                    { time: "[14:41:20]", text: "Plenary Stage screen projection synced." },
                    { time: "[14:44:05]", text: "Dual translation channels activated and checked." },
                    { time: "[14:45:00]", text: "Main server backup line reporting online status." }
                ]
            },
            reg: {
                title: "Visitor Registration Control",
                desc: "Maintains printer links, entrance scans, fast-check lines, and badges.",
                status: "Synchronized",
                lead: "Sana Malik",
                tasks: [
                    "Fast check-in printer calibrations and ticket rolls.",
                    "Real-time ticket server database syncing across entry nodes.",
                    "Pre-registered VIP check-in protocols monitoring."
                ],
                logs: [
                    { time: "[14:42:01]", text: "Entrance node scanner 4 recalibrated." },
                    { time: "[14:45:10]", text: "VIP registration desk reporting zero bottleneck." },
                    { time: "[14:45:55]", text: "Database sync complete. Total arrivals: 3,142." }
                ]
            },
            sec: {
                title: "Security & Protocol Division",
                desc: "Zoning gate locks, VIP escorts, bag screening, and fire safety protocols.",
                status: "Secured",
                lead: "Major (R) Tariq",
                tasks: [
                    "Coordinate VIP entry sweeps and personal security detail routing.",
                    "Main entrance gate screening checks monitoring.",
                    "Fire route clearance audits and emergency egress paths check."
                ],
                logs: [
                    { time: "[14:30:15]", text: "VIP transport escort unit 2 dispatched to gate 1." },
                    { time: "[14:42:40]", text: "Egress zone A cleared of supplier logistics." },
                    { time: "[14:46:12]", text: "All gate monitors reporting zero structural breaches." }
                ]
            },
            speaker: {
                title: "Speaker Coordination Desk",
                desc: "Speaker green rooms, panel schedules, stage rehearsals, and mics.",
                status: "Standby",
                lead: "Ayesha Khan",
                tasks: [
                    "Speaker presentation file transfers and formatting sweeps.",
                    "Rehearsal scheduling and wireless lapel microphone tests.",
                    "Backstage queue coordination during pane-swaps."
                ],
                logs: [
                    { time: "[14:35:10]", text: "Keynote presentation loaded onto server." },
                    { time: "[14:44:02]", text: "Speaker lapel mic 3 tested. Frequency: Clean." },
                    { time: "[14:47:00]", text: "Panel 2 speakers gathered in Green Room 1." }
                ]
            },
            support: {
                title: "Visitor Support Desk",
                desc: "Floor coordinators, information desks, maps, and digital help portals.",
                status: "Active",
                lead: "Faisal Shah",
                tasks: [
                    "Interactive kiosk feedback monitoring and diagnostics.",
                    "Onsite coordinator support updates coordination.",
                    "Medical support teams standby coordination."
                ],
                logs: [
                    { time: "[14:31:05]", text: "Interactive kiosk 3 restarted. Software: Sync." },
                    { time: "[14:40:50]", text: "Floor steward team 2 relocated to Hall B." },
                    { time: "[14:47:15]", text: "Incident queue reporting zero active complaints." }
                ]
            }
        };

        consoleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                consoleTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const teamKey = tab.getAttribute('data-team');
                const data = divisionData[teamKey];

                if (data) {
                    consoleTeamTitle.innerHTML = data.title;
                    consoleTeamDesc.textContent = data.desc;
                    consoleTeamStatus.textContent = data.status;
                    consoleTeamLead.textContent = data.lead;

                    // Set tasks
                    consoleTeamTasks.innerHTML = '';
                    data.tasks.forEach(t => {
                        const li = document.createElement('li');
                        li.textContent = t;
                        consoleTeamTasks.appendChild(li);
                    });

                    // Set logs
                    consoleTeamLogs.innerHTML = '';
                    data.logs.forEach(l => {
                        const entry = document.createElement('div');
                        entry.className = 'log-entry';
                        entry.innerHTML = '<span class="log-time">' + l.time + '</span><span class="log-text">' + l.text + '</span>';
                        consoleTeamLogs.appendChild(entry);
                    });
                }
            });
        });
    }
};

// ========================= EXHIBITION MANAGEMENT: LIVE VISITOR JOURNEY FLOW PROGRESS =========================
const EmVisitorJourneyManager = {
    init() {
        const journeyNodes = document.querySelectorAll('#em-page .journey-node');
        const journeyProgress = document.getElementById('journeyProgress');
        const journeyDetail = document.getElementById('journeyDetail');
        if (!journeyNodes.length || !journeyProgress || !journeyDetail) return;

        const journeyTexts = [
            {
                title: "Step 1: Main Venue Entrance",
                desc: "Visual signages, bag checks, queue control stanchions, and digital directional boards manage the initial massive influx of attendees at venue gates."
            },
            {
                title: "Step 2: Fast-Track Registration Check-in",
                desc: "Attendees use scanned QR code passes at printer kiosks to automatically print their credentials in less than 8 seconds, avoiding lines."
            },
            {
                title: "Step 3: Central Networking Hubs",
                desc: "Coordinators guide visitors into central networking plazas and matching lounges to kick-start initial trade conversations."
            },
            {
                title: "Step 4: Summit Conference Auditoriums",
                desc: "Sound stewards manage theater seating for plenary keynotes, panels, and tech summits, coordinating lighting cues for entry/exit."
            },
            {
                title: "Step 5: Exhibition Pavilions",
                desc: "Floor wardens supervise structural grid walks, keeping exit pathways clear and coordinating exhibitors' logistic needs."
            },
            {
                title: "Step 6: Private Matchmaking Rooms",
                desc: "Protocol executives seat pre-scheduled buyers and sellers for 1-on-1 deals in private VIP suites, managing timing limits."
            },
            {
                title: "Step 7: Exit & Data Surveys",
                desc: "Staff direct the checkout process, collecting digital survey feedback and distributing post-show folders."
            }
        ];

        const updateJourney = (idx) => {
            journeyNodes.forEach((node, nIdx) => {
                node.classList.remove('active', 'passed');
                if (nIdx === idx) {
                    node.classList.add('active');
                } else if (nIdx < idx) {
                    node.classList.add('passed');
                }
            });

            // Update line progress
            const isMobile = window.innerWidth <= 768;
            const pct = (idx / (journeyNodes.length - 1)) * 100;

            if (isMobile) {
                journeyProgress.style.height = pct + '%';
                journeyProgress.style.width = '2px';
            } else {
                journeyProgress.style.width = pct + '%';
                journeyProgress.style.height = '2px';
            }

            // Update detail card
            const info = journeyTexts[idx];
            if (info) {
                journeyDetail.innerHTML = '<h4>' + info.title + '</h4><p>' + info.desc + '</p>';
            }
        };

        journeyNodes.forEach(node => {
            node.addEventListener('click', () => {
                const idx = parseInt(node.getAttribute('data-index'), 10);
                updateJourney(idx);
            });
        });

        // Automatically animate the journey timeline on interval
        let currentJourneyIndex = 0;
        const journeyInterval = setInterval(() => {
            currentJourneyIndex = (currentJourneyIndex + 1) % journeyNodes.length;
            updateJourney(currentJourneyIndex);
        }, 6000);

        // Cancel auto-animation if user clicks a step
        journeyNodes.forEach(node => {
            node.addEventListener('click', () => {
                clearInterval(journeyInterval);
            });
        });
    }
};

// ========================= EXHIBITION MANAGEMENT: CORPORATE SOLUTIONS TAB SELECTION =========================
const EmCorporateSolutionsManager = {
    init() {
        const corpBtns = document.querySelectorAll('#em-page .corp-tab-btn');
        const corpPanes = document.querySelectorAll('#em-page .corp-pane');
        if (!corpBtns.length) return;

        corpBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                corpBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tabKey = btn.getAttribute('data-corp');
                corpPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.getAttribute('id') === 'pane-' + tabKey) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    }
};

// ========================= EXHIBITION MANAGEMENT: STATISTICS KPI ANIMATIONS =========================
const EmKpiCounterManager = {
    init() {
        const kpiVals = document.querySelectorAll('#em-page .kpi-val');
        if (!kpiVals.length) return;

        const animateKPI = (el) => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const format = el.getAttribute('data-format') || '';
            let current = 0;
            const increment = Math.ceil(target / 100);

            const step = () => {
                current += increment;
                if (current < target) {
                    if (format === 'million') {
                        el.textContent = (current / 1000000).toFixed(1) + suffix;
                    } else {
                        el.textContent = current.toLocaleString() + suffix;
                    }
                    requestAnimationFrame(step);
                } else {
                    if (format === 'million') {
                        el.textContent = (target / 1000000).toFixed(1) + suffix;
                    } else {
                        el.textContent = target.toLocaleString() + suffix;
                    }
                }
            };
            step();
        };

        const ioKPI = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                kpiVals.forEach(val => animateKPI(val));
                ioKPI.disconnect();
            }
        }, { threshold: 0.2 });
        ioKPI.observe(kpiVals[0]);
    }
};

// ========================= EXHIBITION MANAGEMENT: FAQ ACCORDION =========================
const EmFaqManager = {
    init() {
        const faqItems = document.querySelectorAll('#em-page .faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(item => {
            const trigger = item.querySelector('.faq-trigger');
            const content = item.querySelector('.faq-content');

            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('faq-active');

                faqItems.forEach(i => {
                    i.classList.remove('faq-active');
                    i.querySelector('.faq-content').style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('faq-active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });

        // Pre-open first FAQ
        const firstFaq = faqItems[0];
        if (firstFaq) {
            const firstFaqContent = firstFaq.querySelector('.faq-content');
            if (firstFaqContent) {
                firstFaq.classList.add('faq-active');
                firstFaqContent.style.maxHeight = firstFaqContent.scrollHeight + 'px';
            }
        }
    }
};

// ========================= INITIALIZE ALL MODULES =========================
document.addEventListener('DOMContentLoaded', () => {
    EmFloorMapManager.init();
    EmLifecycleManager.init();
    EmControlPanelLogManager.init();
    EmVisitorJourneyManager.init();
    EmCorporateSolutionsManager.init();
    EmKpiCounterManager.init();
    EmFaqManager.init();
});
