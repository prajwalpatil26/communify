const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const Opportunity = require('./models/Opportunity');
const Hub = require('./models/Hub');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const firstNames = ['Arjun', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Ananya', 'Rahul', 'Aditi', 'Karan', 'Neha', 'Aarav', 'Diya', 'Ishaan', 'Kavya', 'Dev', 'Tara', 'Rishi', 'Zara', 'Kabir', 'Maya'];
const lastNames = ['Reddy', 'Sharma', 'Patel', 'Singh', 'Gupta', 'Verma', 'Nair', 'Menon', 'Iyer', 'Das', 'Kumar', 'Joshi', 'Chauhan', 'Kaur', 'Yadav', 'Rao', 'Bose', 'Desai', 'Bhat', 'Chatterjee'];
const domains = [
    'Engineering & Technology',
    'Arts & Creative Fields',
    'Sports & Fitness',
    'Business & Management',
    'Science & Research',
    'Healthcare & Medicine',
    'Law & Public Policy',
    'Education & Teaching',
    'Media, Entertainment & Digital',
    'Travel, Hospitality & Aviation',
    'Agriculture & Environment',
    'Skilled Trades & Vocational Careers',
    'Interdisciplinary / Emerging Fields'
];
const skillsPool = [
    'React', 'Node.js', 'Python', 'Rust', 'Solidity', 'AWS', 'TensorFlow', 'AutoCAD', 'SolidWorks', 'Cybersecurity', 'ROS', 'Unity', 'Unreal Engine',
    'Adobe Creative Suite', 'Ableton', 'Cinematography', 'VFX', 'Creative Writing', 'SEO', 'Video Editing', 'Final Cut Pro',
    'Digital Marketing', 'Financial Modeling', 'Corporate Law', 'Supply Chain Management', 'Agile', 'Venture Capital',
    'CRISPR', 'Clinical Research', 'Data Analysis', 'Nursing', 'Pharmacology', 'Cognitive Behavioral Therapy',
    'Public Speaking', 'Curriculum Design', 'Project Management', 'UI/UX Design', 'Sustainable Agriculture', 'Event Planning'
];
const experienceLevels = ['Beginner', 'Intermediate', 'Expert', 'Visionary'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomItems = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const hubPostTemplates = [
  "Has anyone experimented with the latest framework releases in {domain}?",
  "Looking for collaborators for a high-priority project. Skills needed: {skill1}, {skill2}.",
  "Just published my latest research paper. The results are mind-blowing!",
  "Are there any global summits coming up next month? Need to network.",
  "Just secured a massive bounty. Keep grinding, visionaries!",
  "What is the best approach to scaling architecture in {domain}?",
  "Excited about the latest breakthroughs! What is everyone working on right now?",
  "The new API latency is incredible. Sub-10ms response times globally.",
  "Just pushed a massive update to the repository. Reviewers needed.",
  "Anyone available for a quick pair-programming session?"
];

const commentTemplates = [
  "This looks completely insane! Can't wait to see more.",
  "I've been working on something similar. Let's sync up.",
  "Great insights. Do you have a repository I can check out?",
  "Agreed. The efficiency gains are massive.",
  "I'd love to collaborate on this. Sending a connection request now.",
  "Could you share more details on your methodology?",
  "Incredible work! The telemetry data must be wild.",
  "Let's jump on a call later to discuss the integration."
];

const dmTemplates = [
  ["Hey! Have you seen the latest bounty posted in the Nexus?", "Yes! I'm actually assembling a team right now. Are you in?"],
  ["Your profile looks incredible. Let's connect.", "Thanks! Always looking to expand the neural network."],
  ["Are you attending the global summit next week?", "Absolutely. We should definitely meet up there."],
  ["I need an expert. Are you available for a freelance gig?", "My schedule is packed this week, but let's talk next month."],
  ["Did you manage to deploy that scalable server cluster?", "Yes, latency dropped by 40%. The new architecture is bulletproof."]
];

const generateMassiveData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB. Initiating MASSIVE Seed...');

    // Clear everything
    await User.deleteMany({});
    await Project.deleteMany({});
    await Opportunity.deleteMany({});
    await Hub.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing node data.');

    const rawPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    const users = [];

    // Create 50 distinct users
    for(let i = 0; i < 50; i++) {
        const fn = randomItem(firstNames);
        const ln = randomItem(lastNames);
        const domain = randomItem(domains);
        
        users.push({
            name: `${fn} ${ln}`,
            email: `user${i}@communify.global`,
            password: hashedPassword,
            domain: domain,
            bio: `Scalable ${domain} engineer. Building the future.`,
            skills: randomItems(skillsPool, (Math.floor(Math.random() * 4) + 3)), // 3 to 6 skills
            experienceLevel: randomItem(experienceLevels),
            collaborationScore: Math.floor(Math.random() * 800) + 200,
            isPublic: true,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fn}${ln}${i}`
        });
    }

    const savedUsers = await User.insertMany(users);
    console.log(`Injected ${savedUsers.length} Visionary Nodes.`);

    // Hubs
    const hubsToCreate = [...domains];
    const savedHubs = [];
    for(let domain of hubsToCreate) {
        const h = new Hub({
            domain: domain,
            description: `The global neural network for ${domain} innovators.`,
            posts: []
        });
        
        // Generate 20+ posts per hub
        for(let j=0; j<25; j++) {
            const author = randomItem(savedUsers);
            const template = randomItem(hubPostTemplates);
            const content = template
                .replace('{domain}', domain)
                .replace('{skill1}', randomItem(skillsPool))
                .replace('{skill2}', randomItem(skillsPool));

            const post = {
                author: author._id,
                content: content,
                likes: randomItems(savedUsers, Math.floor(Math.random()*10)).map(u => u._id),
                comments: []
            };
            
            // Add comments
            const numComments = Math.floor(Math.random() * 4);
            for(let k=0; k<numComments; k++) {
                post.comments.push({
                    author: randomItem(savedUsers)._id,
                    content: randomItem(commentTemplates)
                });
            }
            h.posts.push(post);
        }
        await h.save();
        savedHubs.push(h);
    }
    console.log(`Injected ${savedHubs.length} Neural Hubs with heavy post/comment density.`);

    // Opportunities - Diverse Types across all Domains
    const opps = [];
    const oppTypes = ['Hackathon', 'Internship', 'Research Project', 'Startup Cohort', 'Bounty', 'Global Summit', 'Exhibition', 'Audition', 'Freelance Gig', 'Partnership', 'Mentorship'];
    for(let i=0; i<40; i++) {
        const type = randomItem(oppTypes);
        const d = new Date();
        d.setDate(d.getDate() + Math.floor(Math.random() * 60) + 1); // 1 to 60 days in future

        opps.push(new Opportunity({
            title: `${type === 'Bounty' ? 'Micro-Task' : 'Opportunity'}: ${randomItem(domains)} Innovation`,
            description: `We need top-tier visionaries to execute on this high-priority ${type}. Extensive rewards and network exposure guaranteed.`,
            type: type,
            domain: randomItem(domains),
            requiredSkills: randomItems(skillsPool, 3),
            reward: type === 'Bounty' || type === 'Freelance Gig' ? `${Math.floor(Math.random()*500)+100} Credits` : `$${Math.floor(Math.random()*50)+10}k Value`,
            deadline: d,
            creator: randomItem(savedUsers)._id
        }));
    }
    await Opportunity.insertMany(opps);
    console.log(`Injected ${opps.length} Bounties & Summits.`);

    // Projects
    const projs = [];
    for(let i=0; i<15; i++) {
        projs.push(new Project({
            title: `Project ${randomItem(['Neon', 'Apollo', 'Titan', 'Aura', 'Zero'])}`,
            description: "A decentralized, high-throughput system aimed at revolutionizing current industry standards using bleeding-edge technology.",
            domain: randomItem(domains),
            status: randomItem(['Open', 'In Progress', 'Completed']),
            creator: randomItem(savedUsers)._id,
            members: randomItems(savedUsers, 3).map(u => u._id),
            tags: randomItems(skillsPool, 3)
        }));
    }
    await Project.insertMany(projs);
    console.log(`Injected ${projs.length} Open Source Projects.`);

    // Form some connections and DMs for the first user to populate dashboard/messages easily
    const heroUser = savedUsers[0];
    const partners = savedUsers.slice(1, 10);
    
    for (let p of partners) {
        heroUser.connections.push(p._id);
        p.connections.push(heroUser._id);
        
        const dmCombo = randomItem(dmTemplates);
        await Message.insertMany([
            { sender: p._id, recipient: heroUser._id, text: dmCombo[0], read: false },
            { sender: heroUser._id, recipient: p._id, text: dmCombo[1], read: true },
        ]);
    }
    await heroUser.save();
    for (let p of partners) {
        await p.save();
    }
    console.log('Injected dense connections and direct messages for primary test user.');

    // Inject Notifications
    await Notification.insertMany([
        { recipient: heroUser._id, type: 'connection_request', content: `${partners[0].name} initiated a synaptic link request.`, sender: partners[0]._id, read: false },
        { recipient: heroUser._id, type: 'connection_accepted', content: `${partners[1].name} accepted your link request. Encrypted channel opened.`, sender: partners[1]._id, read: false },
        { recipient: heroUser._id, type: 'endorsement', content: `${partners[2].name} endorsed your skills in Advanced Networking.`, sender: partners[2]._id, read: true },
        { recipient: heroUser._id, type: 'application_update', content: 'Your application for the Web3 Hackathon has been approved.', read: false },
        { recipient: heroUser._id, type: 'connection_request', content: `${partners[3].name} wants to collaborate on an open source project.`, sender: partners[3]._id, read: false }
    ]);
    console.log('Injected unread notifications into the command center.');

    console.log('MASSIVE SEED COMPLETE. The Matrix is fully populated.');
    process.exit();
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

generateMassiveData();
