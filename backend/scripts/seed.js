import { userModel } from '../models/userModel.js';
import { blogModel } from '../models/blogModel.js';
import { subscriberModel } from '../models/subscriberModel.js';
import { leadModel } from '../models/leadModel.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export async function runSeed() {
  logger.info('Running database seed script...');

  // 1. Seed Admin User
  const existingAdmin = await userModel.findByEmail(env.ADMIN_DEFAULT_EMAIL);
  if (!existingAdmin) {
    await userModel.create({
      name: env.ADMIN_DEFAULT_NAME,
      email: env.ADMIN_DEFAULT_EMAIL,
      password: env.ADMIN_DEFAULT_PASSWORD,
      role: 'admin',
    });
    logger.success(`Seeded default admin user: ${env.ADMIN_DEFAULT_EMAIL} (Password: ${env.ADMIN_DEFAULT_PASSWORD})`);
  } else {
    logger.info(`Admin user already exists: ${env.ADMIN_DEFAULT_EMAIL}`);
  }

  // 2. Seed Initial Blogs
  const blogsCount = await blogModel.getStats();
  if (blogsCount.total === 0) {
    const sampleBlogs = [
      {
        title: 'How to Frame a Warehouse Automation Pilot That Can Scale',
        slug: 'warehouse-automation-pilot-scaling-guide',
        category: 'Robotics & Automation',
        excerpt: 'A practical framework to isolate high-friction material movement workflows, set measurable throughput KPIs, and prepare warehouse operations before committing capex.',
        content: `
### The Challenge of First-Time Automation

Most warehouse automation proof-of-concepts stall because they attempt to automate end-to-end operations simultaneously. In Indian logistics and manufacturing environments, peak volatility, varied packaging dimensions, and mixed floor conditions require targeted deployment.

#### 1. Identify the Repetitive Core
Start with dedicated line-feeding, pallet shuttling, or carton consolidation routes where path predictability exceeds 85%. Autonomous Mobile Robots (AMRs) like Addverb Dynamo provide adaptive lidar mapping without invasive floor modifications.

#### 2. Model Peak vs Off-Peak Cycles
Evaluate battery swap cycles and fleet management software interoperability with your existing WMS / ERP systems.

#### 3. Transitioning from Capex to Equipment Leasing
Rather than tying up 2–5 Cr in upfront hardware, leasing structures spread the financial commitment across predictable operational expenditure.
        `,
        featured_image: '/media/images/addverb-travect.jpg',
        featured_video: '/media/videos/addverb-amr-demo.mp4',
        author: 'Syntellos Industrial Team',
        read_time: '6 min read',
        tags: 'Robotics, AMRs, Warehouse Automation, Logistics, Addverb',
        is_published: true,
      },
      {
        title: 'Using the CCTV You Already Own for Computer Vision & Anomaly Detection',
        slug: 'using-existing-cctv-for-computer-vision-safety',
        category: 'Computer Vision',
        excerpt: 'Deploying visual AI models on existing IP camera feeds to automate perimeter safety, PPE compliance, and pipe leak detection without replacing hardware.',
        content: `
### Unlocking Value from Existing Video Infrastructure

Enterprises across manufacturing and energy infrastructure often maintain hundreds of CCTV and IP camera endpoints. Instead of procuring proprietary camera hardware, modern edge AI processors can tap standard RTSP feeds directly.

#### Key Applications on Factory Floors:
- **PPE & Safety Compliance**: Automatic detection of helmets, high-vis vests, and unauthorized zone entry.
- **Pipeline & Thermal Anomaly Detection**: High-precision detection of gas/oil leaks or structural shifts before critical failure.
- **Inventory & Pallet Counting**: Automated visual reconciliation in dispatch bays.

Deploying on-premise edge appliances ensures sensitive visual telemetry never leaves enterprise firewalls.
        `,
        featured_image: '/media/images/thirdeye-pipe-leak-detection.jpg',
        featured_video: '',
        author: 'Syntellos AI Vision Team',
        read_time: '5 min read',
        tags: 'Computer Vision, CCTV, Industrial Safety, Edge AI',
        is_published: true,
      },
      {
        title: 'What Document Intelligence Needs Before It Goes Live in BFSI',
        slug: 'document-intelligence-readiness-bfsi-guide',
        category: 'GenAI & Agentic AI',
        excerpt: 'The data governance, OCR accuracy benchmarks, and workflow ownership rules Indian BFSI leaders need before rolling out LLM-powered document assistants.',
        content: `
### Bridging Generative AI with Enterprise Governance

Generative AI models and multi-agent systems are transforming loan processing, insurance underwriting, and audit verification. However, production readiness demands strict validation.

#### Essential Pillars for Deployment:
1. **Air-Gapped / Private Cloud Deployment**: Sensitive KYC and transaction documents must remain strictly within Indian sovereign cloud regions (MeitY empaneled) or local data centers.
2. **Deterministic Fallbacks**: Every synthesized answer must provide verbatim source citations and confidence scores.
3. **Human-in-the-Loop Thresholds**: Sub-95% confidence outputs are automatically routed to human officers for exception handling.
        `,
        featured_image: '/media/images/thirdeye-bfsi-document-analysis.jpg',
        featured_video: '',
        author: 'Syntellos Enterprise AI Practice',
        read_time: '7 min read',
        tags: 'GenAI, Document Intelligence, BFSI, Agentic AI, Compliance',
        is_published: true,
      },
      {
        title: 'Why Indian Enterprises Are Leasing High-End AI, GPU & XR Hardware',
        slug: 'why-enterprises-lease-ai-gpu-xr-hardware',
        category: 'Equipment Leasing',
        excerpt: 'How leasing models eliminate upfront capital friction, provide tax optimization, and enable 24-month refresh cycles as hardware evolves.',
        content: `
### The Rapid Obsolescence Dilemma

With GPU architectures and XR headsets evolving on 18–24 month cycles, buying hardware outright frequently leads to balance sheet drag and technological lock-in.

#### Benefits of Structured Hardware Leasing:
- **Zero Heavy Capex Outlay**: Preserve working capital for core growth.
- **Tax Deductibility**: Lease rentals are treated as deductible operating expenses (Opex), improving post-tax economics.
- **Upgrade Flexibility**: Seamlessly swap older headsets (e.g. PICO / RealWear) or GPU servers at lease end.
        `,
        featured_image: '/media/images/orix-equipment-lease.jpg',
        featured_video: '',
        author: 'Syntellos Financing Desk',
        read_time: '4 min read',
        tags: 'Equipment Leasing, Capex Optimization, ORIX, GPU Clusters, XR',
        is_published: true,
      },
      {
        title: 'Setting Up Advanced Robotics & AI Labs in Indian Colleges',
        slug: 'setting-up-robotics-ai-labs-colleges-india',
        category: 'College Labs & Upskilling',
        excerpt: 'A comprehensive roadmap for academic institutions to build industry-aligned robotics, XR simulation, and AI training centers with certified curricula.',
        content: `
### Connecting Academia with Global Industry Standards

Indian engineering institutions are upgrading curriculum infrastructure to prepare graduates for physical AI, industrial robotics, and mixed-reality workflows.

#### Core Lab Architecture:
1. **Collaborative Robot (Cobot) Workstations**: Safe hands-on programming with 6-axis arms.
2. **XR Spatial Simulation Suite**: Virtual testing of manufacturing lines and hazardous training simulations.
3. **Faculty Enablement & Industry Certifications**: Hands-on train-the-trainer workshops covering ROS2, PyTorch, and industrial robotics protocols.
        `,
        featured_image: '/media/images/xterra-robot-03.webp',
        featured_video: '/media/videos/pico-mixed-reality-workflow.mp4',
        author: 'Syntellos Academic Enablement',
        read_time: '6 min read',
        tags: 'College Labs, Robotics Labs, Upskilling, Faculty Enablement, EdTech',
        is_published: true,
      },
      {
        title: 'Hands-Free Frontline Computing: RealWear & AR in Critical Operations',
        slug: 'hands-free-frontline-computing-realwear-ar',
        category: 'AR / VR / XR',
        excerpt: 'How voice-controlled smart glasses and ruggedized head-mounted displays are reducing field service downtime by 40% in utilities and manufacturing.',
        content: `
### Empowering the Deskless Workforce

In oil & gas, transmission grids, and heavy automotive manufacturing, field engineers need real-time manuals, IoT telemetry, and remote expert assistance while keeping both hands on the equipment.

#### Field Impact:
- **100% Voice-Operated in 95dB Noise Environments**.
- **Remote Expert Assist**: Instant bidirectional video calling between field technicians and Tier-3 global specialists.
- **Safety Certified**: IP66 ruggedization and ATEX Zone 1 intrinsic safety compliance.
        `,
        featured_image: '/media/images/realwear-frontline.jpg',
        featured_video: '/media/videos/realwear-one-demo.mp4',
        author: 'Syntellos XR Delivery Team',
        read_time: '5 min read',
        tags: 'RealWear, XR, Augmented Reality, Frontline Workers, Remote Assist',
        is_published: true,
      },
    ];

    for (const b of sampleBlogs) {
      await blogModel.create(b);
    }
    logger.success(`Seeded ${sampleBlogs.length} initial enterprise blogs.`);
  }

  // 3. Seed Sample Subscribers
  const subStats = await subscriberModel.getStats();
  if (subStats.total === 0) {
    const sampleEmails = [
      'cto@manufacturing-enterprise.in',
      'director.innovation@bfsigroup.com',
      'dean.academics@techuniv.edu.in',
      'operations.head@energypower.in',
    ];
    for (const email of sampleEmails) {
      await subscriberModel.create(email);
    }
    logger.success(`Seeded ${sampleEmails.length} sample newsletter subscribers.`);
  }

  // 4. Seed Sample Leads
  const leadStats = await leadModel.getStats();
  if (leadStats.total === 0) {
    const sampleLeads = [
      {
        name: 'Rajesh Sharma',
        email: 'rajesh.sharma@ncr-auto.com',
        phone: '+91 98112 34567',
        organization: 'NCR Automotive Components Ltd',
        city: 'Gurugram, Haryana',
        intent: 'Register as Client (Need Lab / Solution Setup)',
        message: 'Looking to deploy 4 Autonomous Mobile Robots (AMRs) for component transport on our main assembly floor and setup vision-based quality inspection.',
      },
      {
        name: 'Michael Schmidt',
        email: 'm.schmidt@berlin-robotics-oem.de',
        phone: '+49 30 901820',
        organization: 'AeroCobot Dynamics GmbH',
        city: 'Berlin, Germany',
        intent: 'Register as OEM / Global Partner (Want to sell in India)',
        message: 'We manufacture certified high-precision cobots and are seeking a premier GTM and delivery partner in India for distribution and field deployment support.',
      },
      {
        name: 'Prof. Anil Kulkarni',
        email: 'kulkarni.dean@smit-tech.ac.in',
        phone: '+91 94220 87654',
        organization: 'SMIT Institute of Technology',
        city: 'Pune, Maharashtra',
        intent: 'College & Enterprise Lab Setup',
        message: 'Planning to establish an AI, Robotics & XR Center of Excellence with 20 student workstations, ROS2 kits and AR headsets for our upcoming academic year.',
      },
      {
        name: 'Vikram Mehta',
        email: 'vmehta@zenithlogistics.in',
        phone: '+91 98201 11223',
        organization: 'Zenith Logistics Hub',
        city: 'Navi Mumbai',
        intent: 'Equipment Leasing Inquiry',
        message: 'Interested in exploring a 36-month lease structure for 8 warehouse mobile robots and high-speed sorting cameras.',
      },
    ];

    for (const l of sampleLeads) {
      await leadModel.create(l);
    }
    logger.success(`Seeded ${sampleLeads.length} sample enterprise consultation leads.`);
  }

  logger.success('Database seeding completed successfully.');
}
