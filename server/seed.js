const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import Models
const User = require('./models/User');
const Project = require('./models/Project');
const Opportunity = require('./models/Opportunity');
const Hub = require('./models/Hub');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Opportunity.deleteMany({});
    await Hub.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data (Matrix Reset).');

    const rawPassword = 'password123';

    // 1. Seed Indian Visionaries
    const usersData = [
      {
        name: 'Arjun Reddy',
        email: 'arjun@iitb.ac.in',
        password: rawPassword,
        domain: 'Engineering & Technology',
        bio: 'M.Tech CSE at IIT Bombay. Building Indic LLMs and low-latency inference for Indian languages.',
        skills: ['PyTorch', 'Transformers', 'Python', 'CUDA'],
        experienceLevel: 'Expert',
        collaborationScore: 940,
        isPublic: true,
        education: [{ institution: 'IIT Bombay', degree: 'M.Tech', field: 'Computer Science', startYear: '2024', endYear: '2026' }],
        workHistory: [{ company: 'ISRO', role: 'Intern', description: 'Chandrayaan-4 visual tracking system.', startYear: '2025', endYear: '2025' }]
      },
      {
        name: 'Priya Sharma',
        email: 'priya@jio.com',
        password: rawPassword,
        domain: 'Interdisciplinary / Emerging Fields',
        bio: 'Blockchain Architect at Jio Platforms. Decentralizing telecom data ledgers.',
        skills: ['Solidity', 'Rust', 'Ethereum', 'Hyperledger'],
        experienceLevel: 'Visionary',
        collaborationScore: 890,
        isPublic: true,
        education: [{ institution: 'NIT Trichy', degree: 'B.Tech', field: 'ECE', startYear: '2016', endYear: '2020' }],
        workHistory: [{ company: 'Jio Platforms', role: 'Blockchain Architect', description: 'Core ledger logic.', startYear: '2021', endYear: 'Present' }]
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul@srm.edu.in',
        password: rawPassword,
        domain: 'Engineering & Technology',
        bio: 'B.Tech IT at SRM University. Just trying to crack GSoC and survive CP rounds. Looking for hackathon squads!',
        skills: ['Node.js', 'Express', 'MongoDB', 'C++'],
        experienceLevel: 'Intermediate',
        collaborationScore: 420,
        isPublic: true,
        education: [{ institution: 'SRM University', degree: 'B.Tech', field: 'IT', startYear: '2023', endYear: '2027' }]
      },
      {
        name: 'Aisha Khan',
        email: 'aisha@flipkart.com',
        password: rawPassword,
        domain: 'Engineering & Technology',
        bio: 'SDE-2 at Flipkart. Obsessed with React performance, WebGL, and aesthetic UIs for AI applications.',
        skills: ['React', 'Framer Motion', 'Tailwind', 'Three.js'],
        experienceLevel: 'Expert',
        collaborationScore: 875,
        isPublic: true,
        workHistory: [{ company: 'Flipkart', role: 'SDE-2', description: 'Frontend Core team for Big Billion Days scaling.', startYear: '2022', endYear: 'Present' }]
      },
      {
        name: 'Suresh Patil',
        email: 'suresh@ycce.edu',
        password: rawPassword,
        domain: 'Engineering & Technology',
        bio: 'Engineering student from YCCE Nagpur. Tinkering with ESP32 and agricultural tech (AgriTech) solutions for Vidarbha farmers.',
        skills: ['Arduino', 'C', 'Raspberry Pi', 'Python'],
        experienceLevel: 'Beginner',
        collaborationScore: 310,
        isPublic: true,
        education: [{ institution: 'YCCE Nagpur', degree: 'B.E', field: 'Electronics', startYear: '2024', endYear: '2028' }]
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@zomato.com',
        password: rawPassword,
        domain: 'Business & Management',
        bio: 'Principal Engineer at Zomato. Orchestrating millions of food orders and payments.',
        skills: ['Go', 'Kafka', 'PostgreSQL', 'AWS'],
        experienceLevel: 'Visionary',
        collaborationScore: 990,
        isPublic: true
      }
    ];

    const users = [];
    for (let u of usersData) {
      const newUser = await User.create(u);
      users.push(newUser);
    }
    
    // Create Connections
    // Arjun (0) connected with Priya (1), Rahul (2), Aisha (3)
    users[0].connections.push(users[1]._id, users[2]._id, users[3]._id);
    users[1].connections.push(users[0]._id, users[3]._id);
    users[2].connections.push(users[0]._id);
    users[3].connections.push(users[0]._id, users[1]._id);
    
    // Suresh (4) connected with Vikram (5)
    users[4].connections.push(users[5]._id);
    users[5].connections.push(users[4]._id);

    // Save connection updates
    for (let u of users) {
      await u.save();
    }
    console.log('Seeded User Connections.');

    // Seed Messages
    const messagesData = [
      { sender: users[0]._id, recipient: users[1]._id, text: 'Hi Priya, I saw your work on the Jio ledger. Amazing stuff.', read: true },
      { sender: users[1]._id, recipient: users[0]._id, text: 'Thanks Arjun! How is the Indic LLM project going?', read: true },
      { sender: users[0]._id, recipient: users[1]._id, text: 'Getting there. We actually need some advice on decentralizing the inference nodes.', read: false },
      { sender: users[2]._id, recipient: users[0]._id, text: 'Bhai, can you review my PR for the Bhashini wrapper?', read: true },
      { sender: users[0]._id, recipient: users[2]._id, text: 'Yeah, will do it tonight.', read: true },
      { sender: users[3]._id, recipient: users[0]._id, text: 'Arjun, the UI for the new AI tool is ready. Let\'s sync.', read: false },
      { sender: users[4]._id, recipient: users[5]._id, text: 'Sir, I have a doubt regarding Kafka integration for our IoT devices.', read: true },
      { sender: users[5]._id, recipient: users[4]._id, text: 'Sure Suresh, let me know what you need help with.', read: true },
    ];
    await Message.insertMany(messagesData);
    console.log('Seeded Direct Messages.');

    console.log(`Seeded ${users.length} Indian Visionaries.`);

    // 2. Seed Indian Opportunities
    const oppsData = [
      {
        title: 'Smart India Hackathon (SIH) 2026',
        description: 'The world\'s largest open innovation model. Solve complex problem statements issued by Indian Government Ministries (Defense, Railways, Agriculture).',
        domain: 'Engineering & Technology',
        type: 'Hackathon',
        reward: '₹1,00,000 + Funding',
        deadline: new Date('2026-09-15')
      },
      {
        title: 'Flipkart GRID 6.0',
        description: 'Flipkart\'s flagship engineering campus challenge for students. Focus areas: Robotics, InfoSec, and Generative AI.',
        domain: 'Engineering & Technology',
        type: 'Hackathon',
        reward: 'PPI + ₹1,50,000 MakeMyTrip Vouchers',
        deadline: new Date('2026-07-20')
      },
      {
        title: 'ISRO YUVIKA (Yong Scientist Programme)',
        description: 'Imparting basic knowledge on Space Technology, Space Science and Space Applications to emerging students.',
        domain: 'Science & Research', // Closest to Space Science in existing enums
        type: 'Internship',
        reward: 'ISRO Certification',
        deadline: new Date('2026-05-10')
      },
      {
        title: 'Pune Tech Meetup: Web3 & Chai',
        description: 'Local meetup for Tier-2 and Tier-3 college students to learn about Solana and Polygon ecosystems.',
        domain: 'Interdisciplinary / Emerging Fields',
        type: 'Startup Cohort',
        reward: 'Networking + Free Chai',
        deadline: new Date('2026-04-25')
      }
    ];
    await Opportunity.insertMany(oppsData);
    console.log('Seeded Local Indian Opportunities.');

    // 3. Seed Projects / Teams
    const projsData = [
      {
        title: 'Kisan Drone Matrix (Vidarbha)',
        description: 'An ESP32-powered autonomous hexacopter routing system to monitor crop health in drought-prone areas like Vidarbha and Marathwada using local ML models.',
        domain: 'Engineering & Technology',
        status: 'Open',
        creator: users[4]._id, // Suresh
        members: [users[4]._id],
        requiredRoles: [
          { role: 'Computer Vision Dev', skills: ['OpenCV', 'Python'], filled: false },
          { role: 'Drone Hardware Tech', skills: ['Pixhawk', 'Arduino'], filled: false }
        ],
        kanbanTasks: [
          { title: 'Procure ESP32 Cams from Lamington Road', status: 'In Progress', assignedTo: users[4]._id },
          { title: 'Write weather API fetcher for IMD', status: 'To Do', assignedTo: users[4]._id }
        ]
      },
      {
        title: 'Bhashini AI - Multilingual Wrapper',
        description: 'Implementing an extremely low-latency wrapper around Bhashini models to provide instant Marathi-to-Tamil transcompilation for rural e-commerce apps.',
        domain: 'Engineering & Technology',
        status: 'Open',
        creator: users[0]._id, // Arjun
        members: [users[0]._id, users[2]._id], // Arjun + Rahul
        requiredRoles: [
          { role: 'React Native Dev', skills: ['React Native', 'Redux'], filled: false }
        ],
        kanbanTasks: [
          { title: 'Integrate Bhashini APIs', status: 'Done', assignedTo: users[0]._id },
          { title: 'Build Express Router for load balancing', status: 'In Progress', assignedTo: users[2]._id }
        ]
      }
    ];
    await Project.insertMany(projsData);
    console.log('Seeded High-Impact Indian Synapse Teams.');

    // 4. Seed Hubs and Chatter
    const hubs = [
      { 
        domain: 'Engineering & Technology', 
        description: 'Neural convergence for Engineering and Technology in the Indian context.',
        posts: [
          { content: 'Bhai, anyone participating in SIH 2026? Problem statement AK-472 (Agriculture Ministry) looks insane!', author: users[2]._id },
          { content: 'Yes, we are building the Kisan Drone Matrix for it. Need a CV Dev if you are interested, Rahul.', author: users[4]._id }
        ]
      },
      { 
        domain: 'Interdisciplinary / Emerging Fields', 
        description: 'Decentralized technologies and blockchain innovation.',
        posts: [
          { content: 'Trying to convince Jio to put telecom supply chain on a private Ethereum fork. Bureaucracy is tough haha.', author: users[1]._id }
        ]
      },
      { domain: 'Business & Management', description: 'Financial technology and high-frequency transaction systems.' },
      { domain: 'Agriculture & Environment', description: 'Agricultural advancements and rural connectivity.' },
      { domain: 'Sports & Fitness', description: 'Sports tech and fitness data analytics.' },
      { domain: 'Science & Research', description: 'Next-generation scientific research systems.' },
      { domain: 'Arts & Creative Fields', description: 'Creative media, generative design, and VFX.' }
    ];
    
    await Hub.insertMany(hubs);
    console.log('Seeded Made In India Neural Hubs and Chatter.');

    console.log('--- DATABASE MATRIX FULLY INDIANIZED AND SECURED ---');
    process.exit();
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedData();
