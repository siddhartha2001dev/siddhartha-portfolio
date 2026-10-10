const github = 'https://github.com/siddhartha2001dev'

const projects = [
  {
    id: 1,
    title: 'Nuvora',
    category: 'Full Stack / AI E-Commerce',
    year: '2026',
    description: 'An AI-powered e-commerce platform with separate buyer and seller workflows, JWT role-based access control, product management, cart, wishlist, orders and reviews.',
    technologies: ['React.js', 'Redux Toolkit', 'Node.js', 'MongoDB', 'Gemini AI'],
    image: '/projects/thumbnails/nuvora.jpg',
    link: github,
    tone: '#d9d4c7',
  },
  {
    id: 2,
    title: 'Jobly',
    category: 'Full Stack / Job Portal',
    year: '2026',
    description: 'A role-based job portal with candidate and recruiter dashboards, multi-field search, one-click applications, live status tracking, resume uploads and email notifications.',
    technologies: ['React.js', 'Vite', 'Redux Toolkit', 'Express.js', 'JWT'],
    image: '/projects/thumbnails/jobly.jpg',
    link: github,
    tone: '#c9c2b2',
  },
  {
    id: 3,
    title: 'NoteVault',
    category: 'Backend / REST API',
    year: '2026',
    description: 'A secure REST API with access and refresh tokens, password hashing, protected routes, CRUD operations, file uploads and email notifications, validated with Postman.',
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'JWT', 'Multer'],
    image: '/projects/thumbnails/notesvault.jpg',
    link: 'https://github.com/siddhartha2001dev/NotesVault-API',
    tone: '#bdb6a5',
  },
  {
    id: 4,
    title: 'Zuno',
    category: 'MERN / Real-Time Chat',
    year: '2026',
    description: 'A real-time chat application with instant bidirectional messaging over Socket.IO, persistent REST APIs and a responsive React interface for live conversations.',
    technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Socket.IO'],
    image: '/projects/thumbnails/zuno.jpg',
    link: github,
    tone: '#b0a998',
  },
]

export default projects
