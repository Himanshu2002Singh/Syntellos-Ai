import {
  Bot,
  BrainCircuit,
  Glasses,
  RadioTower,
} from "lucide-react";

export const offerings = [
  {
    group: "Consulting, solutions & training",
    title: "Artificial Intelligence",
    shortTitle: "AI",
    text: "Every offering pairs Syntellos AI's on-ground go-to-market strategy with our ecosystem partners' engineering — so Indian enterprises get a local relationship and a globally proven build.",
    icon: BrainCircuit,
    image: "/media/images/thirdeye-genai-services.png",
    imageAlt: "Connected enterprise artificial intelligence system",
    services: [
      {
        title: "AI Strategy & GTM Roadmaps",
        text: "Market-entry strategy, product-market fit and launch plans for AI initiatives, tuned to Indian buyer cycles.",
      },
      {
        title: "GenAI & Agentic AI Solutions",
        text: "Conversational assistants, document intelligence and autonomous agents deployed on production infrastructure.",
      },
      {
        title: "Computer Vision Intelligence",
        text: "Inspection, counting, safety and anomaly detection built on the CCTV and sensors you already run.",
      },
      {
        title: "Predictive AI & Forecasting",
        text: "Asset health, maintenance and demand forecasting models validated against your own historical data.",
      },
      {
        title: "AI Upskilling & Workforce Training",
        text: "Executive AI literacy, engineering training on LLMs and RLHF, and safe-usage programs for operational teams.",
      },
    ],
  },
  {
    group: "Monitoring, operations & labs",
    title: "Internet of Things",
    shortTitle: "IoT",
    text: "Connected assets and live operational data that help teams see conditions earlier and act with confidence.",
    icon: RadioTower,
    image: "/media/images/iot-sensor-monitoring.png",
    imageAlt: "Wireless IoT sensor monitoring industrial equipment",
    services: [
      {
        title: "Connected asset monitoring",
        text: "Sensors, edge devices and dashboards that make asset condition and performance visible in real time.",
      },
      {
        title: "Predictive operations",
        text: "Earlier alerts and data-led maintenance decisions for equipment, facilities and field infrastructure.",
      },
      {
        title: "IoT solution design",
        text: "Pilot planning, platform selection and integration shaped around the operating environment and desired outcome.",
      },
      {
        title: "Smart campus & applied labs",
        text: "Connected campus infrastructure, practical device labs and IoT engineering training built around real operational telemetry.",
      },
    ],
  },
  {
    group: "Automation & equipment access",
    title: "Robotics",
    shortTitle: "Robotics",
    text: "Unbranded and OEM-neutral robotics pathways for pilots, automation programmes and repeatable frontline work.",
    icon: Bot,
    image: "/media/images/stock-robotics-poster.jpg",
    imageAlt: "Unbranded industrial automation equipment",
    services: [
      {
        title: "Robotics advisory",
        text: "Use-case selection, OEM evaluation, site-readiness planning and commercial modelling without locking the brief to one brand.",
      },
      {
        title: "Warehouse & logistics automation",
        text: "Structured AMR and AGV pilots for material movement, inspection, handling and other repeatable operational workflows.",
      },
      {
        title: "Equipment access",
        text: "Leasing and project-based access options that reduce the upfront cost of testing robotics in live environments.",
      },
      {
        title: "Robotics labs for colleges",
        text: "Turnkey hardware setup, faculty enablement and student training programmes for practical robotics education.",
      },
    ],
  },
  {
    group: "AR, VR, smart glasses & labs",
    title: "XR",
    shortTitle: "XR",
    text: "AR and VR systems for frontline assistance, immersive learning, simulation and spatial collaboration.",
    icon: Glasses,
    image: "/media/images/pico-ultra-sensor.png",
    imageAlt: "Virtual reality headset for immersive enterprise work",
    services: [
      {
        title: "AR & smart glasses",
        text: "Hands-free guidance, remote assistance and connected field workflows using devices such as RealWear and smart glasses.",
      },
      {
        title: "VR headsets",
        text: "Immersive learning, simulation and spatial experiences delivered through platforms such as Meta and PICO.",
      },
      {
        title: "XR programme design",
        text: "Hardware selection, experience design, content planning and deployment support for institutional and enterprise use.",
      },
      {
        title: "XR innovation labs",
        text: "Academic and enterprise spatial-computing labs with headset setup, immersive content planning and user enablement.",
      },
    ],
  },
];

export const leasingBenefits = [
  "Reduce heavy upfront capital commitment",
  "Match equipment access to the pilot or rollout period",
  "Create a clearer path to regular technology refreshes",
  "Evaluate potential operating-expense treatment with your financial adviser",
];

export const proofPoints = [
  { value: "10 Cr+", label: "India revenue target for AI & XR consulting, this year" },
  { value: "3 Yrs", label: "Ecosystem partners building presence in the Indian market" },
  { value: "7", label: "Industries actively served: manufacturing to BFSI" },
  { value: "93%+", label: "Model accuracy benchmark, validated not just claimed" },
];

export const audiencePaths = [
  {
    eyebrow: "FOR ENTERPRISES",
    title: "Deploy AI and emerging technology",
    text: "Explore GenAI, agentic AI, computer vision, predictive analytics, IoT, robotics and XR solutions.",
    action: "Explore solutions",
    page: "offerings",
    offeringIndex: 0,
  },
  {
    eyebrow: "FOR COLLEGES & INSTITUTIONS",
    title: "Build practical labs and skills",
    text: "Create AI, robotics, IoT and XR labs with faculty enablement, student training and industry-aligned programmes.",
    action: "View labs & training",
    page: "offerings",
    offeringIndex: 2,
  },
  {
    eyebrow: "FOR GLOBAL OEMs & PARTNERS",
    title: "Enter and grow in India",
    text: "Use local GTM strategy, enterprise relationships, delivery support and customer-success capability.",
    action: "Register as a partner",
    page: "partner",
  },
  {
    eyebrow: "FOR PILOTS & ROLLOUTS",
    title: "Access equipment without heavy CapEx",
    text: "Explore flexible access to GPUs, robotics, XR headsets, cameras, wearables and edge infrastructure.",
    action: "Explore equipment access",
    page: "leasing",
  },
];

export const differentiators = [
  {
    title: "A hybrid, not a reseller or a pure consultancy",
    text: "12+ years of hands-on GTM expertise paired with an ecosystem engineering backbone — clients get market fit and a working system, not a software license or a strategy deck alone.",
  },
  {
    title: "Speed through pre-built systems, not from-scratch builds",
    text: "120–180 day deployment because solutions are pre-engineered and production-tested elsewhere, then localized — not started from a blank page like most boutique AI shops.",
  },
  {
    title: "India-first execution, not an outsourced afterthought",
    text: "A dedicated India entity, an India-based relationship owner, and India-specific go-to-market strategy — not a regional sales rep for a foreign vendor with no local accountability.",
  },
  {
    title: "Full-stack breadth through a single point of contact",
    text: "GenAI, computer vision, predictive AI, upskilling, XR/IoT and equipment financing conversations all route through one relationship, instead of five vendors for one transformation.",
  },
  {
    title: "Data sovereignty built in, not bolted on",
    text: "On-premise and private-cloud deployment options address the compliance concerns — RBI, the DPDP Act, sector-specific norms — that stop many Indian enterprises from adopting AI at all.",
  },
  {
    title: "A de-risked financing path",
    text: "Equipment and technology leasing options mean AI adoption isn't gated by a large capex approval cycle — a structural advantage most AI-only vendors can't offer.",
  },
  {
    title: "Sector-fluent, not generic",
    text: "Industry-specific framing — shop-floor language for manufacturing, compliance language for BFSI — rather than one AI pitch reused across every vertical.",
  },
];

export const faqs = [
  [
    "How fast can a solution go live?",
    "Most solutions can move into deployment in 120–180 days when the relevant engineering has already been built and tested. Timing depends on the use case, integration and readiness.",
  ],
  [
    "Does our data leave our infrastructure?",
    "On-premise and private-cloud deployment options can keep data within the organisation’s environment. The correct approach is confirmed during scoping.",
  ],
  [
    "Who do we work with?",
    "Syntellos is the India-based point of contact for strategy, scoping and relationship management. Specialist ecosystem teams build and support the relevant solution.",
  ],
  [
    "What does it cost?",
    "Cost depends on the solution, scope and complexity. A clear assessment comes before any commercial conversation.",
  ],
  [
    "Why lease equipment instead of buying it?",
    "Leasing can turn upfront equipment cost into predictable payments and make refresh cycles easier. Commercial and tax treatment should be confirmed for the organisation’s circumstances.",
  ],
  [
    "How do we sign up as a partner or reseller?",
    "Share your company profile and focus area through the contact form. Fit is reviewed before an introductory conversation.",
  ],
  [
    "What does onboarding as an ecosystem partner involve?",
    "A short discovery call, a mutual NDA, a scoped pilot or joint opportunity to validate fit, and a formal partnership agreement covering roles, commercials and support commitments.",
  ],
  [
    "Is there a minimum commitment to become a channel or technology partner?",
    "Requirements vary by partnership type — technology integration, reseller, or referral. Commitments are sized to the scale of opportunity in the Indian market, not a fixed minimum.",
  ],
  [
    "Can system integrators or consultants partner with Syntellos AI?",
    "Yes. Syntellos can work with SIs, boutique consultancies and independent GTM partners who bring enterprise relationships in manufacturing, BFSI, energy or healthcare.",
  ],
  [
    "How long does it take to finalize a partnership agreement?",
    "Straightforward referral or reseller arrangements typically close in two to three weeks. Deeper technology integrations or co-delivery partnerships can take longer, depending on legal and technical review.",
  ],
];

export const industryCards = [
  {
    name: "Manufacturing",
    text: "Connected operations, safer work and stronger quality signals.",
    image: "/media/images/xterra-robot-02.jpeg",
    imageAlt: "Industrial robot welding metal in a manufacturing facility",
    useCases: ["Visual quality inspection", "Machine-condition monitoring", "Warehouse and line automation"],
  },
  {
    name: "BFSI",
    text: "Knowledge, documents and customer workflows that move with confidence.",
    image: "/media/images/thirdeye-bfsi-document-analysis.jpg",
    imageAlt: "Analyst reviewing business documents",
    useCases: ["Document intelligence", "Customer-service assistants", "Risk and compliance workflows"],
  },
  {
    name: "Energy",
    text: "Asset intelligence for infrastructure that cannot stand still.",
    image: "/media/images/thirdeye-energy-pole-detection.png",
    imageAlt: "Power transmission infrastructure at sunset",
    useCases: ["Asset inspection", "Field-worker assistance", "Predictive maintenance"],
  },
  {
    name: "Education",
    text: "Learning environments that make emerging technology practical.",
    image: "/media/images/pico-ultra-sensor.png",
    imageAlt: "Mixed reality headset for immersive learning",
    useCases: ["AI, IoT and XR labs", "Faculty enablement", "Hands-on student training"],
  },
  {
    name: "Healthcare",
    text: "Knowledge workflows, operational visibility and responsible automation shaped around sensitive environments.",
    image: "/media/images/thirdeye-genai-services.png",
    imageAlt: "AI-assisted knowledge and data workflow",
    useCases: ["Knowledge assistants", "Operational visibility", "Responsible workflow automation"],
  },
  {
    name: "Telecommunications",
    text: "Connected infrastructure, field support and predictive insight for distributed networks.",
    image: "/media/images/thirdeye-pipe-leak-detection.jpg",
    imageAlt: "Connected industrial infrastructure monitoring",
    useCases: ["Network monitoring", "Field-service support", "Predictive network operations"],
  },
  {
    name: "AdTech & Marketing",
    text: "Customer intelligence, content workflows and measurable automation for modern growth teams.",
    image: "/media/images/thirdeye-customer-behavior.jpg",
    imageAlt: "Customer behaviour analytics in a retail environment",
    useCases: ["Customer intelligence", "Content operations", "Marketing workflow automation"],
  },
];

export const leasingOptions = [
  {
    title: "Robotics & automation",
    text: "Robotics and automation equipment for pilots, projects and operational rollouts.",
    image: "/media/images/stock-robotics-poster.jpg",
    imageAlt: "Unbranded industrial automation equipment",
  },
  {
    title: "XR & wearable systems",
    text: "XR headsets and wearable devices for field work, training and remote support.",
    image: "/media/images/meta-rayban-wayfarer.webp",
    imageAlt: "Meta Ray-Ban smart glasses",
  },
  {
    title: "AI compute & edge",
    text: "Compute and edge equipment sized around the workload, location and duration of your pilot.",
    image: "/media/images/qpi-quantum-bg.jpg",
    imageAlt: "Abstract visual of an advanced computing network",
  },
  {
    title: "Computer vision hardware",
    text: "Cameras and edge devices for visual inspection, retail analytics and operational awareness.",
    image: "/media/images/computer-vision-hardware.png",
    imageAlt: "Unbranded industrial machine-vision cameras and edge hardware",
  },
  {
    title: "Equipment leasing",
    text: "Commercial structures that make it easier to access the equipment a project needs.",
    image: "/media/images/orix-equipment-lease.jpg",
    imageAlt: "Professionals signing an equipment leasing agreement",
  },
];

export const deliverySteps = [
  {
    number: "01",
    title: "Tell us the outcome you need",
    text: "Start with the business, operational or learning problem—not a technology purchase list.",
  },
  {
    number: "02",
    title: "Choose the right service and technology",
    text: "We identify the relevant AI, IoT, robotics or XR route, then define a realistic scope and rollout path.",
  },
  {
    number: "03",
    title: "Pilot, deploy and train your team",
    text: "Our India-based team coordinates delivery, equipment access, user training and the next step after the pilot.",
  },
];

export const partnerSteps = [
  {
    number: "01",
    title: "Introduce your technology",
    text: "Share the product, target customer and the India opportunity you want to explore.",
  },
  {
    number: "02",
    title: "Agree the route to market",
    text: "Define the right GTM, enterprise engagement, delivery and support model together.",
  },
  {
    number: "03",
    title: "Build the first opportunity",
    text: "Move from mutual NDA and market fit to a focused pilot or customer conversation.",
  },
];

export const insightArticles = [
  {
    category: "AI STRATEGY",
    title: "How to choose an AI pilot that can reach production",
    text: "A practical starting point for teams deciding where GenAI, agentic AI or predictive analytics can create measurable value.",
    image: "/media/images/thirdeye-genai-services.png",
  },
  {
    category: "COMPUTER VISION",
    title: "Where visual AI helps operations teams first",
    text: "Inspection, counting, PPE compliance and anomaly detection are clear, measurable use cases for existing camera environments.",
    image: "/media/images/thirdeye-pipe-leak-detection.jpg",
  },
  {
    category: "TRAINING & LABS",
    title: "Building AI, robotics and XR skills that people can use",
    text: "What makes an applied technology lab useful: relevant equipment, hands-on scenarios and enablement for faculty or team leads.",
    image: "/media/images/pico-ultra-sensor.png",
  },
];

export const ecosystemPartners = [
  {
    name: "ThirdEye Data",
    category: "AI & computer vision",
    text: "Applied AI and visual intelligence for enterprise workflows.",
    image: "/media/images/thirdeye-pipe-leak-detection.jpg",
    imageAlt: "Industrial site monitored for a pipeline safety issue",
  },
  {
    name: "RealWear",
    category: "Frontline wearable technology",
    text: "Hands-free technology for connected field and industrial teams.",
    image: "/media/images/realwear-device.png",
    imageAlt: "Field worker using a RealWear headset",
  },
  {
    name: "Meta",
    category: "AI glasses & XR",
    text: "Wearable interfaces that bring useful context closer to the work.",
    image: "/media/images/meta-rayban-wayfarer.webp",
    imageAlt: "Meta Ray-Ban smart glasses",
  },
  {
    name: "PICO",
    category: "XR hardware",
    text: "Immersive hardware for training, simulation and spatial work.",
    image: "/media/images/pico-ultra-sensor.png",
    imageAlt: "PICO mixed reality headset",
  },
  {
    name: "ORIX India",
    category: "Equipment leasing",
    text: "Commercial access structures for equipment-led projects.",
    image: "/media/images/orix-equipment-lease.jpg",
    imageAlt: "Equipment lease agreement discussion",
  },
  {
    name: "Argus Consulting",
    category: "Technology consulting",
    text: "Technology advisory and delivery alignment for enterprise programmes.",
    image: "/media/images/argus-consulting-logo.png",
    imageAlt: "Argus Consulting logo",
    imageType: "logo",
  },
  {
    name: "Qpi Technologies",
    category: "Advanced compute",
    text: "Advanced AI, quantum and next-generation computing capability.",
    image: "/media/images/qpi-technologies-logo.png",
    imageAlt: "Qpi Technologies logo",
    imageType: "logo",
  },
];
