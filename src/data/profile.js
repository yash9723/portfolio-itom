/**
 * Single source of truth for every piece of personal content on the site.
 * Imported by the 3D rooms, the screen-reader overlay and seo-plugin.js (build time),
 * so keep this file plain ESM (no JSX, no browser APIs).
 *
 * TODO(owner): fill the links marked TODO below.
 */

export const SITE_URL = 'https://abhilashjoyeal.work.gd';

const BITFLOW_URL = 'https://bitflow-2-0.onrender.com'; // TODO: confirm

export const PROFILE = {
    fullName: 'Abhilash Joyeal Uppalaguptha',
    displayName: 'ABHILASH',
    shortName: 'ABHI',
    titleLine: 'ABHILASH JOYEAL', // About intro, line 1 (keep ~15 chars)
    subtitleLine: 'UPPALAGUPTHA (ABHI)', // About intro, line 2
    role: 'VLSI & Embedded Systems Engineer',
    taglineWords: ['<', 'vlsi', 'engineer', '/>'],
    university: 'Aditya University',
    email: 'abhilashjoyealuppalaguptha@gmail.com',
    motto: ['"Designing silicon and systems', 'that keep people safe"'],
    summary:
        'Driven Electronics & Communication Engineering student focused on VLSI design, embedded systems and hardware innovation. ' +
        'Actively building projects at the intersection of AI, FPGA/Verilog and real-world problem solving. ' +
        'President of the OPTICA Student Chapter, leading initiatives in deep tech, and passionate about developing ' +
        'defense-grade and socially impactful systems, including safety tech and autonomous platforms.',
    links: {
        github: 'https://github.com/abhilashjoyealuppalaguptha-netizen',
        linkedin: 'https://www.linkedin.com/in/abhilash-joyeal-uppalaguptha-0a4b88325/',
        email: 'mailto:abhilashjoyealuppalaguptha@gmail.com',
        bitflow: BITFLOW_URL,
        resume: '/resume.pdf',
    },
};

export const EDUCATION = [
    { id: 'aditya', degree: 'B.Tech, Electronics & Communication Engineering', school: 'Aditya University', period: '2024 - 2028' },
    { id: 'narayana', degree: 'Class 12 (Intermediate), MPC', school: 'Narayana Junior College', period: '2022 - 2024' },
];

export const EXPERIENCE = [
    {
        id: 'optica',
        role: 'President',
        org: 'OPTICA Student Chapter',
        period: 'Feb 2025 - Present',
        points: [
            'Leading the student chapter focused on photonics, optics and advanced technologies.',
            'Organizing technical events, workshops and knowledge sessions to increase domain engagement.',
            'Driving initiatives to connect students with research and innovation opportunities.',
        ],
    },
    {
        id: 'ecell',
        role: 'Core Team Member',
        org: 'Entrepreneurship Development Cell',
        period: 'Jul 2025 - Present',
        points: [
            'Contributing to planning and execution of large-scale entrepreneurial events like Creathon and E-Summit.',
            'Supporting startup incubation activities, including idea validation and pitching strategies.',
            'Collaborating with leadership teams to expand student participation and outreach.',
        ],
    },
    {
        id: 'naviel',
        role: 'Founding Member',
        org: 'NAVIEL (Startup Initiative)',
        period: 'Jan 2026 - Present',
        points: [
            'Working on better hardware and safer solutions for citizen safety as a multidisciplinary startup initiative.',
            'Contributing to designing tech and innovation that common people need.',
            'Collaborating in a team environment to build and refine innovative solutions.',
        ],
    },
];

const G = '/textures/gallery/';

export const PROJECTS = [
    {
        id: 'bitflow',
        title: 'BITFLOW',
        front: G + 'bitflowprzod.webp',
        painted: G + 'bitflowprzod_painted.webp',
        url: BITFLOW_URL,
        description:
            'An RTL coding platform for Verilog and SystemVerilog, created for the growing demand for RTL design engineers. ' +
            'Designs compile and simulate with Icarus Verilog inside a security-hardened Docker sandbox, ' +
            'served by a FastAPI backend that returns VCD waveforms. Built for reliability and scale.',
        techStack: [G + 'veriloglogo.webp', G + 'pythonlogo.webp', G + 'dockerlogo.webp', G + 'htmllogo.webp'],
        tech: ['Verilog', 'SystemVerilog', 'Icarus Verilog', 'Python', 'FastAPI', 'Docker'],
    },
    {
        id: 'tranatrace',
        title: 'TRANA-TRACE',
        front: G + 'tranatraceprzod.webp',
        painted: G + 'tranatraceprzod_painted.webp',
        url: 'https://github.com/abhilashjoyealuppalaguptha-netizen', // TODO: Trana-Trace repo link, if public
        description:
            'A chip system that helps with mobile security in times of mobile theft and battery drain. ' +
            'I designed the entire VLSI architecture using FSM concepts in Verilog, working across VLSI, IoT and web development.',
        techStack: [G + 'veriloglogo.webp', G + 'chiplogo.webp', G + 'esp32logo.webp', G + 'htmllogo.webp'],
        tech: ['Verilog', 'FSM design', 'VLSI', 'IoT', 'Web'],
    },
    {
        id: 'naviel',
        title: 'NAVIEL',
        front: G + 'navielprzod.webp',
        painted: G + 'navielprzod_painted.webp',
        url: 'https://www.linkedin.com/in/abhilash-joyeal-uppalaguptha-0a4b88325/', // TODO: NAVIEL page, if any
        description:
            'A startup initiative creating better hardware for citizen safety. ' +
            'As a founding member I work with the team on multidisciplinary ideas and tech that common people need.',
        techStack: [G + 'esp32logo.webp', G + 'raspilogo.webp', G + 'pcblogo.webp', G + 'clogo.webp'],
        tech: ['ESP32', 'Raspberry Pi', 'PCB design', 'C'],
    },
    {
        id: 'optica',
        title: 'OPTICA CHAPTER',
        front: G + 'opticaprzod.webp',
        painted: G + 'opticaprzod_painted.webp',
        url: 'https://www.linkedin.com/in/abhilash-joyeal-uppalaguptha-0a4b88325/', // TODO: OPTICA chapter page, if any
        description:
            'Leading the OPTICA Student Chapter: technical events, workshops and knowledge sessions on photonics, optics ' +
            'and advanced technologies, plus initiatives that connect students with research and innovation.',
        techStack: [G + 'opticslogo.webp', G + 'matlablogo.webp', G + 'cadencelogo.webp', G + 'pythonlogo.webp'],
        tech: ['Photonics', 'MATLAB', 'Cadence', 'Python'],
    },
];

export const SKILLS = {
    'Core Domains': ['VLSI Design', 'IoT & Embedded Systems', 'Full Stack'],
    'Programming & Hardware': ['Verilog', 'SystemVerilog', 'C', 'Python', 'HTML', 'CSS', 'MATLAB', 'ESP32', 'Microcontrollers', 'Raspberry Pi', 'Robotics'],
    'Tools & Platforms': ['Cadence', 'MATLAB', 'PCB Design', 'Icarus Verilog', 'Docker', 'FastAPI'],
    'Leadership & Execution': ['Public Speaking', 'Team Leadership', 'Startup Strategy'],
};

/**
 * Event photos: hung in the corridor's picture frames and reused in the Studio and About rooms.
 * `file` / `cropTop` are only read by scripts/art/gen-art.mjs (source in scripts/art/events/).
 */
export const EVENT_PHOTOS = [
    { id: 'veda', title: 'VEDA Student Symposium', place: 'Aditya University', file: 'veda.jpg', cropTop: 0.105 },
    { id: 'techhub', title: 'Technical Hub - Project Space', place: 'Aditya University', file: 'techhub.jpg', cropTop: 0.11 },
].map((p) => ({
    ...p,
    image: `/textures/corridor/photo_${p.id}.webp`,
    painted: `/textures/corridor/photo_${p.id}_painted.webp`,
}));

const A = '/textures/about/';

/** About-room award cards. Keys keep the engine's original ids (sotd/sotm/other). */
export const AWARDS = {
    sotd: {
        id: 'award-sotd',
        cardLabel: 'SPEECH',
        layout: 'certificate_grid',
        title: 'Public Speaking',
        items: [
            { label: 'Viksit Bharat - District Winner', date: 'Speech competition', image: A + 'cert_viksit_district.webp', url: null },
            { label: 'Viksit Bharat - State Level', date: 'State-level participation', image: A + 'cert_viksit_state.webp', url: null },
            { label: 'University Speaking Prizes', date: 'Aditya University', image: A + 'cert_university_speech.webp', url: null },
        ],
        platformConfig: { label: 'AWARD', color: '#1a1a1a', icon: '🎤' },
    },
    sotm: {
        id: 'award-sotm',
        cardLabel: 'LEAD',
        layout: 'certificate_grid',
        title: 'Leadership',
        items: [
            { label: 'President - OPTICA Chapter', date: 'Feb 2025 - Present', image: A + 'cert_optica.webp', url: null },
            { label: 'Core Team - E-Cell', date: 'Jul 2025 - Present', image: A + 'cert_ecell.webp', url: null },
            { label: 'Founding Member - NAVIEL', date: 'Jan 2026 - Present', image: A + 'cert_naviel.webp', url: null },
        ],
        platformConfig: { label: 'ROLE', color: '#1a1a1a', icon: '🧭' },
    },
    other: {
        id: 'award-other',
        cardLabel: 'BUILDS',
        layout: 'certificate_grid',
        title: 'Builds & Moments',
        items: [
            { label: 'BitFlow RTL Platform', date: 'Verilog / SystemVerilog', image: A + 'cert_bitflow.webp', url: BITFLOW_URL },
            { label: 'Trana-Trace Chip', date: 'FSM-based VLSI design', image: A + 'cert_tranatrace.webp', url: null },
            { label: 'VEDA Student Symposium', date: 'Aditya University', image: A + 'cert_veda.webp', photo: 'veda', url: null },
            { label: 'Technical Hub - Project Space', date: 'Aditya University', image: A + 'cert_techhub.webp', photo: 'techhub', url: null },
        ],
        platformConfig: { label: 'PROJECT', color: '#1a1a1a', icon: '🔧' },
    },
};

/** Journey islands in the About sky (left, right). */
export const JOURNEY = {
    subtitle: 'My path so far...',
    left: { texture: A + 'adityawyspa.webp', caption: '2024-2028' },
    right: { texture: A + 'opticawyspa.webp', caption: '2025-NOW' },
};

/** Skill balloons (About room). 10 slots, same layout as the original engine. */
export const BALLOONS = [
    { key: 'verilog', label: 'Verilog', size: 'large', x: -2.5, y: 2, z: 0.3, phase: 0 },
    { key: 'vlsi', label: 'VLSI', size: 'large', x: 2.5, y: 2.5, z: 0.2, phase: 1.5 },
    { key: 'esp32', label: 'ESP32', size: 'large', x: 0, y: 3, z: 0.5, phase: 3 },
    { key: 'python', label: 'Python', size: 'medium', x: -4, y: 1, z: -0.3, phase: 0.8 },
    { key: 'c', label: 'C', size: 'medium', x: 4, y: 1.5, z: -0.2, phase: 2.2 },
    { key: 'raspi', label: 'Raspberry Pi', size: 'medium', x: 0, y: 0.5, z: -0.4, phase: 4 },
    { key: 'matlab', label: 'MATLAB', size: 'small', x: -5.5, y: 2.5, z: -0.8, phase: 1.2 },
    { key: 'cadence', label: 'Cadence', size: 'small', x: 5.5, y: 3, z: -0.7, phase: 2.8 },
    { key: 'pcb', label: 'PCB Design', size: 'small', x: -3, y: 4.5, z: -0.5, phase: 3.5 },
    { key: 'html', label: 'HTML/CSS', size: 'small', x: 3.5, y: 4, z: -0.6, phase: 4.5 },
    { key: 'sv', label: 'System Verilog', size: 'small', x: -1.4, y: 5.4, z: -0.9, phase: 0.4 },
    { key: 'iot', label: 'IoT', size: 'small', x: 1.5, y: 5.2, z: -0.9, phase: 2.6 },
    { key: 'robotics', label: 'Robotics', size: 'small', x: -6.8, y: 4.2, z: -1.1, phase: 3.9 },
    { key: 'docker', label: 'Docker', size: 'small', x: 6.8, y: 1.2, z: -1.1, phase: 5.1 },
].map((b) => ({
    ...b,
    texture: `${A}balloon_${b.key}.webp`,
    paintedTexture: `${A}balloon_${b.key}_painted.webp`,
}));

const S = '/textures/studio/';

/** Studio tower: talks (TV), events (monitor), updates (phone). */
export const STUDIO_PLATFORMS = {
    talk: { color: '#E04A3A', accentColor: '#b8382a', icon: '🎤', label: 'Talk', shape: 'tv' },
    event: { color: '#4A90D9', accentColor: '#2d6cb5', icon: '🛠️', label: 'Event', shape: 'monitor' },
    update: { color: '#0A66C2', accentColor: '#084e96', icon: '📣', label: 'Update', shape: 'phone' },
};

// `date` is shown as-is in the overlay and parsed with `new Date()` for "latest" sorting.
export const STUDIO_ITEMS = [
    {
        id: 'talk-viksit',
        platform: 'talk',
        title: 'Viksit Bharat Speech - District Winner',
        description: 'Won the Viksit Bharat speech competition at district level and went on to state-level participation.',
        date: '2025',
    },
    {
        id: 'talk-optica',
        platform: 'talk',
        title: 'OPTICA Knowledge Sessions',
        description: 'Knowledge sessions organized by the OPTICA Student Chapter to grow engagement with photonics, optics and advanced technologies.',
        date: 'Feb 2025',
    },
    {
        id: 'talk-university',
        platform: 'talk',
        title: 'University Public Speaking',
        description: 'Many prizes in public speaking competitions at Aditya University.',
        date: '2024',
    },
    {
        id: 'event-esummit',
        platform: 'event',
        title: 'E-Summit - E-Cell Core Team',
        description: 'Planning and executing E-Summit with the Entrepreneurship Development Cell, and expanding student participation and outreach.',
        date: 'Jul 2025',
    },
    {
        id: 'event-creathon',
        platform: 'event',
        title: 'Creathon',
        description: 'Part of the core team running Creathon, a large-scale entrepreneurial event, supporting idea validation and pitching strategies.',
        date: 'Aug 2025',
    },
    {
        id: 'event-workshop',
        platform: 'event',
        title: 'OPTICA Technical Workshops',
        description: 'Technical events and workshops connecting students with research and innovation opportunities.',
        date: 'Mar 2025',
    },
    {
        id: 'event-veda',
        platform: 'event',
        title: 'VEDA Student Symposium',
        description: 'Moments from VEDA, the student symposium at Aditya University.',
        date: '12th Sep', // year not known; unparseable dates sort last in the Studio
        photo: 'veda',
    },
    {
        id: 'event-techhub',
        platform: 'event',
        title: 'Technical Hub - Project Space',
        description: 'Project Space showcase with the Technical Hub team at Aditya University.',
        date: 'Technical Hub',
        photo: 'techhub',
    },
    {
        id: 'update-bitflow',
        platform: 'update',
        title: 'BitFlow is live! ⚡',
        description: 'BitFlow, an RTL coding platform for Verilog and SystemVerilog, is online. Try it out.',
        url: BITFLOW_URL,
        date: 'Jun 2026',
    },
    {
        id: 'update-naviel',
        platform: 'update',
        title: 'Founding NAVIEL 🚀',
        description: 'Joined NAVIEL as a founding member, a startup initiative building hardware for citizen safety.',
        date: 'Jan 2026',
    },
    {
        id: 'update-tranatrace',
        platform: 'update',
        title: 'Trana-Trace ✅',
        description: 'A VLSI chip system for mobile security during theft and battery drain, with the architecture designed using FSMs in Verilog.',
        date: '2025',
    },
].map((item) => ({
    url: PROFILE.links.linkedin,
    ...item,
    frontTexture: `${S}screen_${item.id}.webp`,
    paintedFrontTexture: `${S}screen_${item.id}_painted.webp`,
}));
